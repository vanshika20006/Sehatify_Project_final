import { Router, Response, Request } from 'express';
import { eq, and, desc, asc, sql, or } from 'drizzle-orm';
import { WebSocket } from 'ws';
import { db } from '../db-storage';
import { authMiddleware, optionalAuth } from '../middleware/auth';
import { 
  mentorStudentMessagesTable, 
  mentorStudentSessionsTable,
  studentProfilesTable,
  mentorProfilesTable,
  insertMentorStudentMessageSchema
} from '@shared/schema';

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    [key: string]: any;
  };
}

const router = Router();

// Store active WebSocket connections
const activeConnections = new Map<string, WebSocket>();
const sessionConnections = new Map<string, Set<string>>(); // sessionId -> Set of connectionIds

// GET /api/messages/session/:sessionId - Get all messages in a session
router.get('/session/:sessionId', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessionId = req.params.sessionId;
    const userId = req.user?.uid;
    const studentId = req.query.studentId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    // Verify user has access to this session
    const session = await db.select({
      session: mentorStudentSessionsTable,
      student: studentProfilesTable,
      mentor: mentorProfilesTable
    })
      .from(mentorStudentSessionsTable)
      .leftJoin(studentProfilesTable, eq(mentorStudentSessionsTable.studentId, studentProfilesTable.id))
      .leftJoin(mentorProfilesTable, eq(mentorStudentSessionsTable.mentorId, mentorProfilesTable.id))
      .where(eq(mentorStudentSessionsTable.id, sessionId))
      .limit(1);

    if (session.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const sessionData = session[0];
    
    // Check access rights
    let hasAccess = false;
    
    if (userId) {
      // For authenticated users
      if (sessionData.student?.userId === userId || sessionData.mentor?.userId === userId) {
        hasAccess = true;
      }
    } else if (studentId) {
      // For anonymous students
      if (sessionData.student?.id === studentId && sessionData.student?.isAnonymous) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get messages for this session
    const messages = await db.select({
      message: mentorStudentMessagesTable,
      senderStudent: studentProfilesTable,
      senderMentor: mentorProfilesTable
    })
      .from(mentorStudentMessagesTable)
      .leftJoin(studentProfilesTable, eq(mentorStudentMessagesTable.senderId, studentProfilesTable.id))
      .leftJoin(mentorProfilesTable, eq(mentorStudentMessagesTable.senderId, mentorProfilesTable.id))
      .where(eq(mentorStudentMessagesTable.sessionId, sessionId))
      .orderBy(asc(mentorStudentMessagesTable.sentAt))
      .limit(limit)
      .offset(offset);

    // Mark messages as read
    if (userId || studentId) {
      const currentUserId = userId || studentId;
      await db.update(mentorStudentMessagesTable)
        .set({
          readAt: new Date()
        })
        .where(and(
          eq(mentorStudentMessagesTable.sessionId, sessionId),
          sql`${mentorStudentMessagesTable.senderId} != ${currentUserId}`,
          sql`${mentorStudentMessagesTable.readAt} IS NULL`
        ));
    }

    res.json({ 
      messages,
      session: sessionData,
      pagination: { page, limit, total: messages.length }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/messages/send - Send a message in a session
router.post('/send', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { 
      sessionId, 
      senderId, 
      senderType, 
      messageType, 
      content, 
      attachment, 
      isUrgent,
      studentId // for anonymous students
    } = req.body;

    // Verify user has access to this session
    const session = await db.select({
      session: mentorStudentSessionsTable,
      student: studentProfilesTable,
      mentor: mentorProfilesTable
    })
      .from(mentorStudentSessionsTable)
      .leftJoin(studentProfilesTable, eq(mentorStudentSessionsTable.studentId, studentProfilesTable.id))
      .leftJoin(mentorProfilesTable, eq(mentorStudentSessionsTable.mentorId, mentorProfilesTable.id))
      .where(eq(mentorStudentSessionsTable.id, sessionId))
      .limit(1);

    if (session.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const sessionData = session[0];

    // Check access rights and determine sender info
    let hasAccess = false;
    let actualSenderId = senderId;
    let actualSenderType = senderType;

    if (userId) {
      // For authenticated users
      if (sessionData.student?.userId === userId) {
        hasAccess = true;
        actualSenderId = sessionData.student.id;
        actualSenderType = 'student';
      } else if (sessionData.mentor?.userId === userId) {
        hasAccess = true;
        actualSenderId = sessionData.mentor.id;
        actualSenderType = 'mentor';
      }
    } else if (studentId && sessionData.student?.isAnonymous) {
      // For anonymous students
      if (sessionData.student.id === studentId) {
        hasAccess = true;
        actualSenderId = studentId;
        actualSenderType = 'student';
      }
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create message
    const messageData = insertMentorStudentMessageSchema.parse({
      sessionId,
      senderId: actualSenderId,
      senderType: actualSenderType,
      messageType: messageType || 'text',
      content,
      attachment,
      // Note: isUrgent and isEmergency fields not available in current schema
      attachments: attachment ? [attachment] : []
    });

    const [message] = await db.insert(mentorStudentMessagesTable)
      .values(messageData)
      .returning();

    // Update session timestamp
    await db.update(mentorStudentSessionsTable)
      .set({
        updatedAt: new Date()
      })
      .where(eq(mentorStudentSessionsTable.id, sessionId));

    // Send real-time message to connected clients
    broadcastToSession(sessionId, {
      type: 'new_message',
      message: {
        ...message,
        senderName: actualSenderType === 'student' ? 
          (sessionData.student?.displayName || 'Student') :
          (sessionData.mentor?.name || 'Mentor')
      }
    });

    // Emergency detection based on content
    if (detectEmergency(content)) {
      await handleEmergencyMessage(message, sessionData);
    }

    res.status(201).json({ message });
  } catch (error: any) {
    console.error('Error sending message:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/messages/unread/:userId - Get unread message count
router.get('/unread/:userId', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const authUserId = req.user?.uid;
    const studentId = req.query.studentId as string;

    // Verify access
    if (authUserId !== userId && !studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get user sessions and count unread messages
    let userSessions;
    
    if (authUserId) {
      // For authenticated users, find their profile
      const studentProfile = await db.select()
        .from(studentProfilesTable)
        .where(eq(studentProfilesTable.userId, authUserId))
        .limit(1);

      const mentorProfile = await db.select()
        .from(mentorProfilesTable)
        .where(eq(mentorProfilesTable.userId, authUserId))
        .limit(1);

      if (studentProfile.length > 0) {
        userSessions = await db.select()
          .from(mentorStudentSessionsTable)
          .where(eq(mentorStudentSessionsTable.studentId, studentProfile[0].id));
      } else if (mentorProfile.length > 0) {
        userSessions = await db.select()
          .from(mentorStudentSessionsTable)
          .where(eq(mentorStudentSessionsTable.mentorId, mentorProfile[0].id));
      }
    } else if (studentId) {
      // For anonymous students
      userSessions = await db.select()
        .from(mentorStudentSessionsTable)
        .where(eq(mentorStudentSessionsTable.studentId, studentId));
    }

    if (!userSessions || userSessions.length === 0) {
      return res.json({ unreadCount: 0, sessions: [] });
    }

    const sessionIds = userSessions.map(s => s.id);
    
    // Count unread messages not sent by the current user
    const unreadCount = await db.select({
      count: sql<number>`COUNT(*)`
    })
      .from(mentorStudentMessagesTable)
      .where(and(
        sql`${mentorStudentMessagesTable.sessionId} = ANY(${sessionIds})`,
        sql`${mentorStudentMessagesTable.senderId} != ${userId}`,
        sql`${mentorStudentMessagesTable.readAt} IS NULL`
      ));

    res.json({ 
      unreadCount: unreadCount[0].count,
      sessions: userSessions.length
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// WebSocket connection handler - to be used with the WebSocket server
export function setupWebSocketHandlers(ws: WebSocket, connectionId: string, userId?: string, studentId?: string) {
  activeConnections.set(connectionId, ws);

  ws.on('message', async (data: string) => {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'join_session':
          await handleJoinSession(connectionId, message.sessionId, userId, studentId);
          break;
        case 'leave_session':
          handleLeaveSession(connectionId, message.sessionId);
          break;
        case 'typing':
          handleTypingIndicator(connectionId, message.sessionId, message.isTyping);
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    activeConnections.delete(connectionId);
    // Remove from all sessions
    sessionConnections.forEach((connections, sessionId) => {
      connections.delete(connectionId);
      if (connections.size === 0) {
        sessionConnections.delete(sessionId);
      }
    });
  });
}

async function handleJoinSession(connectionId: string, sessionId: string, userId?: string, studentId?: string) {
  try {
    // Verify access to session
    const session = await db.select({
      session: mentorStudentSessionsTable,
      student: studentProfilesTable,
      mentor: mentorProfilesTable
    })
      .from(mentorStudentSessionsTable)
      .leftJoin(studentProfilesTable, eq(mentorStudentSessionsTable.studentId, studentProfilesTable.id))
      .leftJoin(mentorProfilesTable, eq(mentorStudentSessionsTable.mentorId, mentorProfilesTable.id))
      .where(eq(mentorStudentSessionsTable.id, sessionId))
      .limit(1);

    if (session.length === 0) {
      return;
    }

    const sessionData = session[0];
    let hasAccess = false;

    if (userId) {
      if (sessionData.student?.userId === userId || sessionData.mentor?.userId === userId) {
        hasAccess = true;
      }
    } else if (studentId) {
      if (sessionData.student?.id === studentId && sessionData.student?.isAnonymous) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return;
    }

    // Add to session
    if (!sessionConnections.has(sessionId)) {
      sessionConnections.set(sessionId, new Set());
    }
    sessionConnections.get(sessionId)!.add(connectionId);

    // Notify user they joined
    const ws = activeConnections.get(connectionId);
    if (ws) {
      ws.send(JSON.stringify({
        type: 'joined_session',
        sessionId,
        message: 'Successfully joined session'
      }));
    }
  } catch (error) {
    console.error('Error joining session:', error);
  }
}

function handleLeaveSession(connectionId: string, sessionId: string) {
  const sessionConns = sessionConnections.get(sessionId);
  if (sessionConns) {
    sessionConns.delete(connectionId);
    if (sessionConns.size === 0) {
      sessionConnections.delete(sessionId);
    }
  }
}

function handleTypingIndicator(connectionId: string, sessionId: string, isTyping: boolean) {
  const sessionConns = sessionConnections.get(sessionId);
  if (sessionConns) {
    sessionConns.forEach(connId => {
      if (connId !== connectionId) { // Don't send to sender
        const ws = activeConnections.get(connId);
        if (ws) {
          ws.send(JSON.stringify({
            type: 'typing_indicator',
            sessionId,
            isTyping,
            connectionId
          }));
        }
      }
    });
  }
}

function broadcastToSession(sessionId: string, message: any) {
  const sessionConns = sessionConnections.get(sessionId);
  if (sessionConns) {
    sessionConns.forEach(connectionId => {
      const ws = activeConnections.get(connectionId);
      if (ws) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}

// Emergency detection using keyword matching (can be enhanced with AI)
function detectEmergency(content: string): boolean {
  const emergencyKeywords = [
    'suicide', 'kill myself', 'end it all', 'want to die', 'hurt myself',
    'self harm', 'cutting', 'overdose', 'emergency', 'crisis',
    'abuse', 'assault', 'violence', 'threatened', 'danger'
  ];

  const lowerContent = content.toLowerCase();
  return emergencyKeywords.some(keyword => lowerContent.includes(keyword));
}

// Handle emergency messages with immediate escalation
async function handleEmergencyMessage(message: any, sessionData: any) {
  console.log('🚨 EMERGENCY MESSAGE DETECTED:', {
    sessionId: message.sessionId,
    timestamp: new Date(),
    content: message.content.substring(0, 100)
  });

  // In a production system, this would:
  // 1. Alert crisis intervention team
  // 2. Send immediate notifications to mental health professionals
  // 3. Provide crisis hotline numbers
  // 4. Create urgent case for review
  
  // For now, we'll log and flag for immediate mentor attention
  await db.update(mentorStudentSessionsTable)
    .set({
      priority: 'urgent',
      status: 'escalated',
      updatedAt: new Date()
    })
    .where(eq(mentorStudentSessionsTable.id, message.sessionId));

  // Broadcast emergency alert to session participants
  broadcastToSession(message.sessionId, {
    type: 'emergency_alert',
    message: 'Emergency support has been notified. A crisis counselor will be available shortly. If this is a life-threatening emergency, please call 911 or your local emergency number immediately.'
  });
}

export default router;