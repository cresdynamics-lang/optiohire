import * as fs from 'fs';
import * as path from 'path';

// 1. Register demos route in backend/src/server.ts (if not already)
const indexPath = path.join(process.cwd(), 'src/server.ts');
let indexContent = fs.readFileSync(indexPath, 'utf8');

if (!indexContent.includes('/api/demos')) {
    // Import
    indexContent = indexContent.replace(
        /import analyticsRoutes from '.\/src\/routes\/analytics.js'/,
        `import analyticsRoutes from './src/routes/analytics.js'\nimport demosRoutes from './src/routes/demos.js'`
    );
    // Use
    indexContent = indexContent.replace(
        /app.use\('\/api\/analytics', analyticsRoutes\)/,
        `app.use('/api/analytics', analyticsRoutes)\napp.use('/api/demos', demosRoutes)`
    );
    fs.writeFileSync(indexPath, indexContent);
    console.log('Registered /api/demos in index.ts');
}

// 2. Create src/routes/demos.ts
const demosRoutesPath = path.join(process.cwd(), 'src/routes/demos.js'); // Use .ts for creation
const demosRoutesTsPath = path.join(process.cwd(), 'src/routes/demos.ts');

const demosRoutesContent = `import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { scheduleDemo, getAdminDemos, markDemoSeen } from '../api/demosController.js'

const router = express.Router()

router.post('/', authenticate, scheduleDemo)
router.get('/admin', authenticate, getAdminDemos)
router.put('/admin/:id/seen', authenticate, markDemoSeen)

export default router
`;
fs.writeFileSync(demosRoutesTsPath, demosRoutesContent);
console.log('Created src/routes/demos.ts');

// 3. Update adminController.ts for support tickets
const adminControllerPath = path.join(process.cwd(), 'src/api/adminController.ts');
let adminControllerContent = fs.readFileSync(adminControllerPath, 'utf8');

if (!adminControllerContent.includes('markSupportTicketSeen')) {
    // Need EmailService imported
    if (!adminControllerContent.includes('EmailService')) {
        adminControllerContent = adminControllerContent.replace(
            /import { query } from '..\/db\/index.js'/,
            `import { query } from '../db/index.js'\nimport { EmailService } from '../services/emailService.js'`
        );
    }
    
    const ticketMethod = `
export async function markSupportTicketSeen(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update support tickets' });
    }

    const { id } = req.params;
    
    // Check if seen_at column exists. If not, just set status='seen'
    let result;
    try {
      result = await query(
        \`UPDATE support_tickets SET seen_at = NOW(), status = 'seen', seen_by = $1 WHERE ticket_id = $2 RETURNING *\`,
        [user.email, id]
      );
    } catch (colErr) {
      // Fallback if schema doesn't have seen_at
      result = await query(
        \`UPDATE support_tickets SET status = 'seen' WHERE ticket_id = $1 RETURNING *\`,
        [id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Support ticket not found' });
    }

    const ticket = result.rows[0];

    // Send confirmation email to the user
    try {
      const emailService = new EmailService();
      await emailService.sendSupportTicketSeen(ticket.user_email, ticket.subject);
    } catch (emailErr) {
      console.error('Failed to send support ticket seen confirmation email:', emailErr);
    }

    return res.json({ message: 'Support ticket marked as seen', ticket });
  } catch (error) {
    console.error('Error marking support ticket as seen:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
`;
    adminControllerContent += `\n${ticketMethod}`;
    fs.writeFileSync(adminControllerPath, adminControllerContent);
    console.log('Added markSupportTicketSeen to adminController.ts');
}

// 4. Update src/routes/admin.ts
const adminRoutesPath = path.join(process.cwd(), 'src/routes/admin.ts');
let adminRoutesContent = fs.readFileSync(adminRoutesPath, 'utf8');

if (!adminRoutesContent.includes('markSupportTicketSeen')) {
    adminRoutesContent = adminRoutesContent.replace(
        /getSupportTickets/g,
        'getSupportTickets, markSupportTicketSeen'
    );
    adminRoutesContent = adminRoutesContent.replace(
        /router.get\('\/support-tickets', authenticate, requireAdmin, getSupportTickets\)/,
        `router.get('/support-tickets', authenticate, requireAdmin, getSupportTickets)\nrouter.put('/support-tickets/:id/seen', authenticate, requireAdmin, markSupportTicketSeen)`
    );
    fs.writeFileSync(adminRoutesPath, adminRoutesContent);
    console.log('Added /support-tickets/:id/seen to admin routes');
}
