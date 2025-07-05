# AutismCare Platform Documentation

## Overview

AutismCare is a comprehensive web application designed to support parents, caregivers, and healthcare professionals in autism detection and child development tracking. The platform provides evidence-based tools for early autism screening, developmental milestone tracking, and AI-powered guidance.

## Features

### 🔐 Authentication & User Management
- Secure username/password authentication via Convex Auth
- User profile management with role-based access (parent, caregiver, professional)
- Multi-child support per user account

### 👶 Child Management
- Add and manage multiple child profiles
- Track basic information: name, date of birth, gender, medical history
- Age validation for M-CHAT eligibility (0-10 years)
- Automatic age calculation in months

### 📝 M-CHAT Assessment
- Complete Modified Checklist for Autism in Toddlers (M-CHAT) questionnaire
- 20 evidence-based questions across multiple developmental domains
- Real-time progress tracking during assessment
- Automated scoring and risk level calculation (Low/Medium/High)
- Assessment history and results tracking

### 📈 Progress Tracking
- Developmental milestone tracking across three categories:
  -  Behavioral : Behavioral patterns and responses
  -  Communication : Language and communication skills
  -  Social : Social interaction and engagement
- Achievement status tracking (Working on it / Achieved)
- Severity indicators (Mild/Moderate/Severe)
- Progress statistics and percentage completion
- Notes and observations for each milestone

### 🤖 AI Assistant
- Specialized AI assistant for autism support and guidance
- Context-aware responses based on child's profile and assessment history
- Multiple session types:
  - General Support
  - Assessment Help
  - Therapy Guidance
- Chat history and session management
- Evidence-based recommendations and strategies

### 📊 Dashboard & Analytics
- Comprehensive overview of child's development
- Quick access to key metrics and recent assessments
- Progress visualization across all developmental categories
- Quick action buttons for common tasks

## Technical Architecture

### Frontend (React + TypeScript)
-  Framework : Vite + React 18
-  Styling : TailwindCSS with custom design system
-  State Management : Convex React hooks for real-time data
-  UI Components : Custom component library with consistent design
-  Animations : CSS animations and transitions for enhanced UX

### Backend (Convex)
-  Database : Convex real-time database
-  Authentication : Convex Auth with username/password
-  Functions : Type-safe queries, mutations, and actions
-  Real-time Updates : Automatic UI updates when data changes
-  AI Integration : OpenAI GPT-4.1-nano for AI assistant

### Key Technologies
-  TypeScript : Full type safety across frontend and backend
-  Convex : Real-time backend-as-a-service
-  TailwindCSS : Utility-first CSS framework
-  Sonner : Toast notifications
-  OpenAI API : AI-powered assistance

## Database Schema

### Users Table (Auth)
```typescript
{
  name?: string;
  image?: string;
  email?: string;
  emailVerificationTime?: number;
  phone?: string;
  phoneVerificationTime?: number;
  isAnonymous?: boolean;
}
```

### Profiles Table
```typescript
{
  userId: Id<"users">;
  firstName: string;
  lastName: string;
  role: "parent" | "caregiver" | "professional";
  organization?: string;
  phone?: string;
  createdAt: number;
}
```

### Children Table
```typescript
{
  parentId: Id<"users">;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  currentAge: number; // in months
  gender: "male" | "female" | "other";
  medicalHistory?: string;
  createdAt: number;
}
```

### M-CHAT Tables

#### mchatQuestions
```typescript
{
  id: number;
  text: string;
  category: "social" | "communication" | "behavioral" | "sensory";
  critical: boolean;
}
```

#### mchatResponses
```typescript
{
  childId: Id<"children">;
  parentId: Id<"users">;
  sessionId: string;
  responses: Array<{
    questionId: number;
    answer: "yes" | "no";
    timestamp: number;
  }>;
  totalScore: number;
  riskLevel: "low" | "medium" | "high";
  completedAt: number;
}
```

### Progress Tracking

#### progressEntries
```typescript
{
  childId: Id<"children">;
  parentId: Id<"users">;
  category: "behavioral" | "communication" | "social";
  milestone: string;
  achieved: boolean;
  notes?: string;
  severity?: "mild" | "moderate" | "severe";
  dateRecorded: number;
}
```

### Chat System

#### chatSessions
```typescript
{
  userId: Id<"users">;
  childId?: Id<"children">;
  title: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: number;
    messageId: string;
  }>;
  sessionType: "general" | "assessment" | "therapy";
  createdAt: number;
  updatedAt: number;
}
```

## API Reference

### Children Management
- `getMyChildren()` - Get all children for current user
- `getChild(childId)` - Get specific child details
- `addChild(data)` - Add new child profile
- `updateChild(childId, data)` - Update child information

### M-CHAT Assessment
- `getMChatQuestions()` - Get all M-CHAT questions
- `saveMChatResponse(data)` - Save assessment responses
- `getMChatHistory(childId)` - Get assessment history for child

### Progress Tracking
- `getProgressEntries(childId, category?)` - Get progress entries
- `addProgressEntry(data)` - Add new milestone entry
- `updateProgressEntry(entryId, data)` - Update milestone status
- `getProgressStats(childId)` - Get progress statistics

### AI Assistant
- `generateAIResponse(message, context)` - Generate AI response
- `saveChatMessage(data)` - Save chat interaction
- `createChatSession(data)` - Create new chat session
- `updateChatSession(sessionId, messages)` - Update chat session

### User Profiles
- `getCurrentProfile()` - Get current user's profile
- `createProfile(data)` - Create user profile
- `updateProfile(data)` - Update user profile

## User Interface Components

### Core Components
-  App.tsx : Main application component with routing
-  Dashboard : Overview and quick actions
-  MChatQuestionnaire : Interactive assessment interface
-  ProgressTracking : Milestone management and visualization
-  AIAssistant : Chat interface with AI
-  ChildManagement : Child profile management
-  ProfileSetup : Initial user profile creation

### Design System
-  Colors : Primary (blue), Secondary (purple), Accent (teal), Success (green), Warning (yellow), Error (red)
-  Typography : Nunito Sans font family
-  Spacing : Consistent spacing scale using Tailwind
-  Components : Reusable button, input, card, and modal components

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Convex account

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Convex: `npx convex dev`
4. Start development server: `npm run dev`

### Environment Variables
- `CONVEX_OPENAI_API_KEY`: OpenAI API key for AI assistant
- `CONVEX_OPENAI_BASE_URL`: OpenAI API base URL

## Usage Guide

### For Parents/Caregivers
1.  Create Account : Sign up with username/password
2.  Setup Profile : Complete profile with role and contact info
3.  Add Child : Enter child's basic information
4.  Take M-CHAT : Complete autism screening assessment
5.  Track Progress : Log developmental milestones
6.  Use AI Assistant : Get personalized guidance and support

### For Healthcare Professionals
1.  Professional Account : Set up with professional role
2.  Multiple Children : Manage multiple patient profiles
3.  Assessment Review : Review M-CHAT results and history
4.  Progress Monitoring : Track developmental progress over time
5.  AI Consultation : Use AI for evidence-based recommendations

## M-CHAT Scoring System

### Risk Levels
-  Low Risk (0-2 points) : Typical development patterns
-  Medium Risk (3-7 points) : Some autism characteristics identified
-  High Risk (8+ points) : Higher likelihood of autism spectrum characteristics

### Critical Items
Certain questions are marked as critical and carry additional weight in the assessment.

## AI Assistant Capabilities

### Context Awareness
- Child's age and developmental stage
- Recent M-CHAT assessment results
- Progress tracking data and milestones
- Previous chat history

### Response Types
- Evidence-based information about autism
- Practical strategies and interventions
- Assessment result interpretation
- Therapeutic activity suggestions
- Emotional support and guidance

### Safety Features
- No medical diagnosis provision
- Encourages professional consultation
- Evidence-based recommendations only
- Cultural sensitivity and inclusivity

## Security & Privacy

### Data Protection
- Secure authentication with Convex Auth
- User data isolation and access control
- HIPAA-compliant data handling practices
- Encrypted data transmission

### Access Control
- Role-based permissions
- Child data restricted to authorized users
- Session-based authentication
- Secure API endpoints

## Performance & Scalability

### Real-time Updates
- Convex provides automatic real-time synchronization
- Optimistic updates for better user experience
- Efficient query optimization

### Caching Strategy
- Client-side caching with Convex React hooks
- Automatic cache invalidation
- Optimized data fetching

## Deployment

### Production Setup
1. Deploy to Convex production environment
2. Configure environment variables
3. Set up custom domain (optional)
4. Configure monitoring and analytics

### Monitoring
- Error tracking and logging
- Performance monitoring
- User analytics and usage patterns

## Contributing

### Development Guidelines
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Component-based architecture
- Comprehensive error handling
- Accessibility compliance (WCAG 2.1)

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Accessibility testing

## Support & Resources

### Documentation
- API reference documentation
- Component library documentation
- User guides and tutorials

### Community
- GitHub issues for bug reports
- Feature request process
- Community forums and support

## Roadmap

### Planned Features
- Multi-language support
- Advanced analytics and reporting
- Integration with healthcare systems
- Mobile application
- Telehealth integration
- Advanced AI capabilities

### Version History
- v1.0: Initial release with core features
- Future versions: Enhanced AI, mobile support, integrations

---

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Acknowledgments

- M-CHAT-R/F™ assessment tool
- Autism research community
- Open source contributors
- Healthcare professionals providing guidance

---

*For technical support or questions, please refer to the documentation or contact the development team.*
