import { Router, Response, Request } from 'express';
import { eq, and, desc, sql, asc } from 'drizzle-orm';
import { db } from '../db-storage';
import { authMiddleware } from '../middleware/auth';
import { 
  mentorProfilesTable, 
  studentProfilesTable, 
  mentorStudentSessionsTable,
  mentorStudentMessagesTable,
  mentorResourcesTable,
  guidanceCategoriesTable,
  emergencyEscalationsTable,
  mentorRatingsTable,
  insertMentorProfileSchema,
  insertMentorStudentSessionSchema,
  insertMentorResourceSchema
} from '@shared/schema';

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    [key: string]: any;
  };
}

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/mentors/profile - Get current mentor's profile
router.get('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const mentor = await db.select()
      .from(mentorProfilesTable)
      .where(eq(mentorProfilesTable.userId, userId))
      .limit(1);

    if (mentor.length === 0) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    res.json({ mentor: mentor[0] });
  } catch (error) {
    console.error('Error fetching mentor profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/mentors/register - Register as a mentor
router.post('/register', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate input
    const mentorData = insertMentorProfileSchema.parse({
      userId,
      email: req.user?.email,
      ...req.body
    });

    // Check if mentor already exists
    const existing = await db.select()
      .from(mentorProfilesTable)
      .where(eq(mentorProfilesTable.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Mentor profile already exists' });
    }

    // Create mentor profile
    const [mentor] = await db.insert(mentorProfilesTable)
      .values(mentorData)
      .returning();

    res.status(201).json({ mentor });
  } catch (error: any) {
    console.error('Error registering mentor:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/mentors/profile - Update mentor profile
router.put('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const updatedData = {
      ...req.body,
      updatedAt: new Date()
    };

    const [mentor] = await db.update(mentorProfilesTable)
      .set(updatedData)
      .where(eq(mentorProfilesTable.userId, userId))
      .returning();

    if (!mentor) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    res.json({ mentor });
  } catch (error) {
    console.error('Error updating mentor profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/mentors/sessions - Get mentor's sessions
router.get('/sessions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // First get mentor profile
    const mentor = await db.select()
      .from(mentorProfilesTable)
      .where(eq(mentorProfilesTable.userId, userId))
      .limit(1);

    if (mentor.length === 0) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    let query = db.select({
      session: mentorStudentSessionsTable,
      student: studentProfilesTable,
      category: guidanceCategoriesTable
    })
      .from(mentorStudentSessionsTable)
      .leftJoin(studentProfilesTable, eq(mentorStudentSessionsTable.studentId, studentProfilesTable.id))
      .leftJoin(guidanceCategoriesTable, eq(mentorStudentSessionsTable.categoryId, guidanceCategoriesTable.id))
      .where(eq(mentorStudentSessionsTable.mentorId, mentor[0].id))
      .orderBy(desc(mentorStudentSessionsTable.updatedAt))
      .limit(limit)
      .offset(offset);

    if (status) {
      query = db.select({
        session: mentorStudentSessionsTable,
        student: studentProfilesTable,
        category: guidanceCategoriesTable
      })
        .from(mentorStudentSessionsTable)
        .leftJoin(studentProfilesTable, eq(mentorStudentSessionsTable.studentId, studentProfilesTable.id))
        .leftJoin(guidanceCategoriesTable, eq(mentorStudentSessionsTable.categoryId, guidanceCategoriesTable.id))
        .where(and(
          eq(mentorStudentSessionsTable.mentorId, mentor[0].id),
          eq(mentorStudentSessionsTable.status, status)
        ))
        .orderBy(desc(mentorStudentSessionsTable.updatedAt))
        .limit(limit)
        .offset(offset);
    }

    const sessions = await query;

    res.json({ sessions, pagination: { page, limit, total: sessions.length } });
  } catch (error) {
    console.error('Error fetching mentor sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/mentors/sessions/:sessionId/accept - Accept a session request
router.post('/sessions/:sessionId/accept', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const sessionId = req.params.sessionId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get mentor profile
    const mentor = await db.select()
      .from(mentorProfilesTable)
      .where(eq(mentorProfilesTable.userId, userId))
      .limit(1);

    if (mentor.length === 0) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    // Update session status
    const [session] = await db.update(mentorStudentSessionsTable)
      .set({ 
        status: 'active',
        startedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(
        eq(mentorStudentSessionsTable.id, sessionId),
        eq(mentorStudentSessionsTable.mentorId, mentor[0].id)
      ))
      .returning();

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Error accepting session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/mentors/sessions/:sessionId/complete - Complete a session
router.post('/sessions/:sessionId/complete', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const sessionId = req.params.sessionId;
    const { summary, outcome, mentorNotes } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get mentor profile
    const mentor = await db.select()
      .from(mentorProfilesTable)
      .where(eq(mentorProfilesTable.userId, userId))
      .limit(1);

    if (mentor.length === 0) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    // Calculate duration
    const session = await db.select()
      .from(mentorStudentSessionsTable)
      .where(eq(mentorStudentSessionsTable.id, sessionId))
      .limit(1);

    if (session.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const duration = session[0].startedAt ? 
      Math.round((new Date().getTime() - new Date(session[0].startedAt).getTime()) / 60000) : 0;

    // Update session
    const [updatedSession] = await db.update(mentorStudentSessionsTable)
      .set({ 
        status: 'completed',
        endedAt: new Date(),
        summary,
        outcome,
        mentorNotes,
        duration,
        updatedAt: new Date()
      })
      .where(and(
        eq(mentorStudentSessionsTable.id, sessionId),
        eq(mentorStudentSessionsTable.mentorId, mentor[0].id)
      ))
      .returning();

    // Update mentor's total sessions
    await db.update(mentorProfilesTable)
      .set({ 
        totalSessions: sql`${mentorProfilesTable.totalSessions} + 1`,
        updatedAt: new Date()
      })
      .where(eq(mentorProfilesTable.id, mentor[0].id));

    res.json({ session: updatedSession });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/mentors/resources - Get mentor's resources
router.get('/resources', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get mentor profile
    const mentor = await db.select()
      .from(mentorProfilesTable)
      .where(eq(mentorProfilesTable.userId, userId))
      .limit(1);

    if (mentor.length === 0) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    const resources = await db.select({
      resource: mentorResourcesTable,
      category: guidanceCategoriesTable
    })
      .from(mentorResourcesTable)
      .leftJoin(guidanceCategoriesTable, eq(mentorResourcesTable.categoryId, guidanceCategoriesTable.id))
      .where(eq(mentorResourcesTable.mentorId, mentor[0].id))
      .orderBy(desc(mentorResourcesTable.createdAt));

    res.json({ resources });
  } catch (error) {
    console.error('Error fetching mentor resources:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/mentors/resources - Create a new resource
router.post('/resources', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get mentor profile
    const mentor = await db.select()
      .from(mentorProfilesTable)
      .where(eq(mentorProfilesTable.userId, userId))
      .limit(1);

    if (mentor.length === 0) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    // Validate input
    const resourceData = insertMentorResourceSchema.parse({
      mentorId: mentor[0].id,
      ...req.body
    });

    const [resource] = await db.insert(mentorResourcesTable)
      .values(resourceData)
      .returning();

    res.status(201).json({ resource });
  } catch (error: any) {
    console.error('Error creating resource:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/mentors/dashboard - Get mentor dashboard data
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get mentor profile
    const mentor = await db.select()
      .from(mentorProfilesTable)
      .where(eq(mentorProfilesTable.userId, userId))
      .limit(1);

    if (mentor.length === 0) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    const mentorId = mentor[0].id;

    // Get statistics
    const [activeSessions] = await db.select({ count: sql<number>`count(*)` })
      .from(mentorStudentSessionsTable)
      .where(and(
        eq(mentorStudentSessionsTable.mentorId, mentorId),
        eq(mentorStudentSessionsTable.status, 'active')
      ));

    const [completedSessions] = await db.select({ count: sql<number>`count(*)` })
      .from(mentorStudentSessionsTable)
      .where(and(
        eq(mentorStudentSessionsTable.mentorId, mentorId),
        eq(mentorStudentSessionsTable.status, 'completed')
      ));

    const [avgRating] = await db.select({ 
      avg: sql<number>`AVG(${mentorRatingsTable.rating})` 
    })
      .from(mentorRatingsTable)
      .where(eq(mentorRatingsTable.mentorId, mentorId));

    const [totalResources] = await db.select({ count: sql<number>`count(*)` })
      .from(mentorResourcesTable)
      .where(eq(mentorResourcesTable.mentorId, mentorId));

    // Get recent sessions
    const recentSessions = await db.select({
      session: mentorStudentSessionsTable,
      student: studentProfilesTable,
      category: guidanceCategoriesTable
    })
      .from(mentorStudentSessionsTable)
      .leftJoin(studentProfilesTable, eq(mentorStudentSessionsTable.studentId, studentProfilesTable.id))
      .leftJoin(guidanceCategoriesTable, eq(mentorStudentSessionsTable.categoryId, guidanceCategoriesTable.id))
      .where(eq(mentorStudentSessionsTable.mentorId, mentorId))
      .orderBy(desc(mentorStudentSessionsTable.updatedAt))
      .limit(5);

    const dashboard = {
      stats: {
        activeSessions: activeSessions.count,
        completedSessions: completedSessions.count,
        averageRating: avgRating.avg ? parseFloat(avgRating.avg.toFixed(1)) : 0,
        totalResources: totalResources.count
      },
      recentSessions,
      mentor: mentor[0]
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Error fetching mentor dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/mentors/availability - Check mentor availability
router.get('/availability', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const mentor = await db.select()
      .from(mentorProfilesTable)
      .where(eq(mentorProfilesTable.userId, userId))
      .limit(1);

    if (mentor.length === 0) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    res.json({ 
      availability: mentor[0].availability,
      isOnline: mentor[0].isOnline,
      lastActiveAt: mentor[0].lastActiveAt
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/mentors/availability - Update mentor availability
router.post('/availability', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { isOnline, availability } = req.body;

    const [mentor] = await db.update(mentorProfilesTable)
      .set({ 
        isOnline: isOnline ?? undefined,
        availability: availability ?? undefined,
        lastActiveAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(mentorProfilesTable.userId, userId))
      .returning();

    if (!mentor) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    res.json({ 
      availability: mentor.availability,
      isOnline: mentor.isOnline,
      lastActiveAt: mentor.lastActiveAt
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;