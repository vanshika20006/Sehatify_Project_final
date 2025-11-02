import { Router, Response, Request } from 'express';
import { eq, and, desc, sql, asc, inArray } from 'drizzle-orm';
import { db } from '../db-storage';
import { authMiddleware, optionalAuth } from '../middleware/auth';
import { 
  studentProfilesTable, 
  mentorProfilesTable, 
  mentorStudentSessionsTable,
  mentorStudentMessagesTable,
  guidanceCategoriesTable,
  mentorResourcesTable,
  mentorRatingsTable,
  insertStudentProfileSchema,
  insertMentorStudentSessionSchema,
  insertMentorRatingSchema
} from '@shared/schema';

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    [key: string]: any;
  };
}

const router = Router();

// GET /api/students/profile - Get current student's profile (requires auth)
router.get('/profile', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const student = await db.select()
      .from(studentProfilesTable)
      .where(eq(studentProfilesTable.userId, userId))
      .limit(1);

    if (student.length === 0) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    res.json({ student: student[0] });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/students/register - Register as a student (anonymous or with auth)
router.post('/register', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid; // Optional for anonymous students
    const { isAnonymous, ...studentData } = req.body;

    // Validate input
    const studentProfileData = insertStudentProfileSchema.parse({
      userId: isAnonymous ? undefined : userId,
      isAnonymous: isAnonymous || false,
      email: isAnonymous ? undefined : req.user?.email,
      ...studentData
    });

    // Check if student profile already exists for this user
    if (userId) {
      const existing = await db.select()
        .from(studentProfilesTable)
        .where(eq(studentProfilesTable.userId, userId))
        .limit(1);

      if (existing.length > 0) {
        return res.status(409).json({ error: 'Student profile already exists' });
      }
    }

    // Create student profile
    const [student] = await db.insert(studentProfilesTable)
      .values(studentProfileData)
      .returning();

    res.status(201).json({ student });
  } catch (error: any) {
    console.error('Error registering student:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/students/profile - Update student profile (requires auth or session ID)
router.put('/profile', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { studentId, ...updatedData } = req.body;

    // For authenticated users, use their userId, for anonymous, use studentId
    let whereCondition;
    if (userId) {
      whereCondition = eq(studentProfilesTable.userId, userId);
    } else if (studentId) {
      whereCondition = eq(studentProfilesTable.id, studentId);
    } else {
      return res.status(400).json({ error: 'Either authentication or studentId required' });
    }

    const updatePayload = {
      ...updatedData,
      updatedAt: new Date()
    };

    const [student] = await db.update(studentProfilesTable)
      .set(updatePayload)
      .where(whereCondition)
      .returning();

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    res.json({ student });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/students/guidance-categories - Get all available guidance categories
router.get('/guidance-categories', async (req: Request, res: Response) => {
  try {
    const categories = await db.select()
      .from(guidanceCategoriesTable)
      .where(eq(guidanceCategoriesTable.isActive, true))
      .orderBy(asc(guidanceCategoriesTable.name));

    res.json({ categories });
  } catch (error) {
    console.error('Error fetching guidance categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/students/mentors/available - Get available mentors based on category
router.get('/mentors/available', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    let query = db.select({
      mentor: mentorProfilesTable,
      averageRating: sql<number>`AVG(${mentorRatingsTable.rating})`,
      totalRatings: sql<number>`COUNT(${mentorRatingsTable.id})`
    })
      .from(mentorProfilesTable)
      .leftJoin(mentorRatingsTable, eq(mentorProfilesTable.id, mentorRatingsTable.mentorId))
      .where(and(
        eq(mentorProfilesTable.isActive, true),
        eq(mentorProfilesTable.verificationStatus, 'verified'),
        eq(mentorProfilesTable.isOnline, true)
      ))
      .groupBy(mentorProfilesTable.id)
      .orderBy(desc(sql`AVG(${mentorRatingsTable.rating})`))
      .limit(limit)
      .offset(offset);

    // Filter by specialization if category is provided
    if (category) {
      query = db.select({
        mentor: mentorProfilesTable,
        averageRating: sql<number>`AVG(${mentorRatingsTable.rating})`,
        totalRatings: sql<number>`COUNT(${mentorRatingsTable.id})`
      })
        .from(mentorProfilesTable)
        .leftJoin(mentorRatingsTable, eq(mentorProfilesTable.id, mentorRatingsTable.mentorId))
        .where(and(
          eq(mentorProfilesTable.isActive, true),
          eq(mentorProfilesTable.verificationStatus, 'verified'),
          eq(mentorProfilesTable.isOnline, true),
          sql`${mentorProfilesTable.specialization} @> ${JSON.stringify([category])}`
        ))
        .groupBy(mentorProfilesTable.id)
        .orderBy(desc(sql`AVG(${mentorRatingsTable.rating})`))
        .limit(limit)
        .offset(offset);
    }

    const mentors = await query;

    res.json({ mentors, pagination: { page, limit, total: mentors.length } });
  } catch (error) {
    console.error('Error fetching available mentors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/students/sessions/request - Request a session with a mentor
router.post('/sessions/request', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { 
      studentId, 
      mentorId, 
      categoryId, 
      sessionType, 
      sessionTitle, 
      initialConcern, 
      priority 
    } = req.body;

    // Get student profile (either by userId or studentId for anonymous)
    let student;
    if (userId) {
      const studentResult = await db.select()
        .from(studentProfilesTable)
        .where(eq(studentProfilesTable.userId, userId))
        .limit(1);
      student = studentResult[0];
    } else if (studentId) {
      const studentResult = await db.select()
        .from(studentProfilesTable)
        .where(eq(studentProfilesTable.id, studentId))
        .limit(1);
      student = studentResult[0];
    }

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Validate mentor exists and is available
    const mentor = await db.select()
      .from(mentorProfilesTable)
      .where(and(
        eq(mentorProfilesTable.id, mentorId),
        eq(mentorProfilesTable.isActive, true),
        eq(mentorProfilesTable.verificationStatus, 'verified')
      ))
      .limit(1);

    if (mentor.length === 0) {
      return res.status(404).json({ error: 'Mentor not found or unavailable' });
    }

    // Create session
    const sessionData = insertMentorStudentSessionSchema.parse({
      studentId: student.id,
      mentorId,
      categoryId,
      sessionType: sessionType || 'chat',
      sessionTitle,
      initialConcern,
      priority: priority || 'normal',
      status: 'active' // Sessions start active for immediate chat
    });

    const [session] = await db.insert(mentorStudentSessionsTable)
      .values(sessionData)
      .returning();

    res.status(201).json({ session });
  } catch (error: any) {
    console.error('Error creating session request:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/students/sessions - Get student's sessions
router.get('/sessions', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const studentId = req.query.studentId as string;

    if (!userId && !studentId) {
      return res.status(400).json({ error: 'Either authentication or studentId required' });
    }

    // Get student profile
    let student;
    if (userId) {
      const studentResult = await db.select()
        .from(studentProfilesTable)
        .where(eq(studentProfilesTable.userId, userId))
        .limit(1);
      student = studentResult[0];
    } else if (studentId) {
      const studentResult = await db.select()
        .from(studentProfilesTable)
        .where(eq(studentProfilesTable.id, studentId))
        .limit(1);
      student = studentResult[0];
    }

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    let query = db.select({
      session: mentorStudentSessionsTable,
      mentor: mentorProfilesTable,
      category: guidanceCategoriesTable
    })
      .from(mentorStudentSessionsTable)
      .leftJoin(mentorProfilesTable, eq(mentorStudentSessionsTable.mentorId, mentorProfilesTable.id))
      .leftJoin(guidanceCategoriesTable, eq(mentorStudentSessionsTable.categoryId, guidanceCategoriesTable.id))
      .where(eq(mentorStudentSessionsTable.studentId, student.id))
      .orderBy(desc(mentorStudentSessionsTable.updatedAt))
      .limit(limit)
      .offset(offset);

    if (status) {
      query = db.select({
        session: mentorStudentSessionsTable,
        mentor: mentorProfilesTable,
        category: guidanceCategoriesTable
      })
        .from(mentorStudentSessionsTable)
        .leftJoin(mentorProfilesTable, eq(mentorStudentSessionsTable.mentorId, mentorProfilesTable.id))
        .leftJoin(guidanceCategoriesTable, eq(mentorStudentSessionsTable.categoryId, guidanceCategoriesTable.id))
        .where(and(
          eq(mentorStudentSessionsTable.studentId, student.id),
          eq(mentorStudentSessionsTable.status, status)
        ))
        .orderBy(desc(mentorStudentSessionsTable.updatedAt))
        .limit(limit)
        .offset(offset);
    }

    const sessions = await query;

    res.json({ sessions, pagination: { page, limit, total: sessions.length } });
  } catch (error) {
    console.error('Error fetching student sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/students/sessions/:sessionId/rate - Rate a completed session
router.post('/sessions/:sessionId/rate', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessionId = req.params.sessionId;
    const userId = req.user?.uid;
    const { studentId, rating, review, categories, wouldRecommend, isAnonymous } = req.body;

    // Get student profile
    let student;
    if (userId) {
      const studentResult = await db.select()
        .from(studentProfilesTable)
        .where(eq(studentProfilesTable.userId, userId))
        .limit(1);
      student = studentResult[0];
    } else if (studentId) {
      const studentResult = await db.select()
        .from(studentProfilesTable)
        .where(eq(studentProfilesTable.id, studentId))
        .limit(1);
      student = studentResult[0];
    }

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Verify session exists and belongs to student
    const session = await db.select()
      .from(mentorStudentSessionsTable)
      .where(and(
        eq(mentorStudentSessionsTable.id, sessionId),
        eq(mentorStudentSessionsTable.studentId, student.id),
        eq(mentorStudentSessionsTable.status, 'completed')
      ))
      .limit(1);

    if (session.length === 0) {
      return res.status(404).json({ error: 'Session not found or not completed' });
    }

    // Create rating
    const ratingData = insertMentorRatingSchema.parse({
      studentId: student.id,
      mentorId: session[0].mentorId,
      sessionId,
      rating,
      review,
      categories,
      wouldRecommend: wouldRecommend ?? true,
      isAnonymous: isAnonymous ?? true
    });

    const [mentorRating] = await db.insert(mentorRatingsTable)
      .values(ratingData)
      .returning();

    // Update session with rating
    await db.update(mentorStudentSessionsTable)
      .set({ 
        rating,
        feedback: review,
        updatedAt: new Date()
      })
      .where(eq(mentorStudentSessionsTable.id, sessionId));

    // Update mentor's average rating
    const avgRating = await db.select({
      average: sql<number>`AVG(${mentorRatingsTable.rating})`
    })
      .from(mentorRatingsTable)
      .where(eq(mentorRatingsTable.mentorId, session[0].mentorId));

    await db.update(mentorProfilesTable)
      .set({ 
        rating: avgRating[0].average,
        updatedAt: new Date()
      })
      .where(eq(mentorProfilesTable.id, session[0].mentorId));

    res.status(201).json({ rating: mentorRating });
  } catch (error: any) {
    console.error('Error rating session:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/students/resources - Get approved resources for students
router.get('/resources', async (req: Request, res: Response) => {
  try {
    const categoryId = req.query.categoryId as string;
    const resourceType = req.query.resourceType as string;
    const tags = req.query.tags as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    let query = db.select({
      resource: mentorResourcesTable,
      mentor: mentorProfilesTable,
      category: guidanceCategoriesTable
    })
      .from(mentorResourcesTable)
      .leftJoin(mentorProfilesTable, eq(mentorResourcesTable.mentorId, mentorProfilesTable.id))
      .leftJoin(guidanceCategoriesTable, eq(mentorResourcesTable.categoryId, guidanceCategoriesTable.id))
      .where(eq(mentorResourcesTable.isApproved, true))
      .orderBy(desc(mentorResourcesTable.createdAt))
      .limit(limit)
      .offset(offset);

    // Apply filters
    const conditions = [eq(mentorResourcesTable.isApproved, true)];
    
    if (categoryId) {
      conditions.push(eq(mentorResourcesTable.categoryId, categoryId));
    }
    
    if (resourceType) {
      conditions.push(eq(mentorResourcesTable.resourceType, resourceType));
    }
    
    if (tags) {
      const tagList = tags.split(',');
      conditions.push(sql`${mentorResourcesTable.tags} @> ${JSON.stringify(tagList)}`);
    }

    if (conditions.length > 1) {
      query = db.select({
        resource: mentorResourcesTable,
        mentor: mentorProfilesTable,
        category: guidanceCategoriesTable
      })
        .from(mentorResourcesTable)
        .leftJoin(mentorProfilesTable, eq(mentorResourcesTable.mentorId, mentorProfilesTable.id))
        .leftJoin(guidanceCategoriesTable, eq(mentorResourcesTable.categoryId, guidanceCategoriesTable.id))
        .where(and(...conditions))
        .orderBy(desc(mentorResourcesTable.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const resources = await query;

    // Increment view count for returned resources
    if (resources.length > 0) {
      const resourceIds = resources.map(r => r.resource.id);
      await db.update(mentorResourcesTable)
        .set({ 
          views: sql`${mentorResourcesTable.views} + 1`,
          updatedAt: new Date()
        })
        .where(inArray(mentorResourcesTable.id, resourceIds));
    }

    res.json({ resources, pagination: { page, limit, total: resources.length } });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/students/anonymous-check/:id - Check if anonymous profile exists
router.get('/anonymous-check/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const student = await db.select({
      id: studentProfilesTable.id,
      displayName: studentProfilesTable.displayName,
      isAnonymous: studentProfilesTable.isAnonymous,
      privacyLevel: studentProfilesTable.privacyLevel
    })
      .from(studentProfilesTable)
      .where(and(
        eq(studentProfilesTable.id, id),
        eq(studentProfilesTable.isAnonymous, true),
        eq(studentProfilesTable.isActive, true)
      ))
      .limit(1);

    if (student.length === 0) {
      return res.status(404).json({ error: 'Anonymous student not found' });
    }

    res.json({ student: student[0], exists: true });
  } catch (error) {
    console.error('Error checking anonymous student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;