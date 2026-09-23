export interface SkillCoursePost {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  detailedInfo: string;
  category: string;
  applicationLink: string;
  contactInfo: string;
  requirements: string;
  deadline: string;
  status: 'active' | 'inactive';
  sortOrder: number;
  instructor?: string;
  duration?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FreelanceOpportunityItem {
  id: string;
  title: string;
  image: string;
  description: string;
  workDetails: string;
  category: string; // Skill / Category
  earningInfo: string; // e.g. ৳৫,০০০ - ৳১০,০০০ / মাস
  applicationLink: string; // Application / Join link
  deadline: string;
  status: 'active' | 'inactive';
  contactInfo?: string;
  requirements?: string;
  clientName?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ProofSubmissionType = 'screenshot' | 'image' | 'text' | 'link' | 'screenshot_link';

export interface MarketingTaskItem {
  id: string;
  title: string;
  thumbnail: string;
  instructions: string;
  marketingLink: string;
  rewardAmount: number;
  taskLimit: number; // 0 = unlimited
  completedCount: number;
  startDate: string;
  endDate: string;
  proofType: ProofSubmissionType;
  proofRequirement: string;
  status: 'active' | 'inactive';
  sortOrder?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface MarketingSubmissionItem {
  id: string;
  taskId: string;
  taskTitle: string;
  rewardAmount: number;
  userId: string;
  userName: string;
  userPhone: string;
  proofType: ProofSubmissionType;
  proof: string;
  proofImage?: string;
  proofText?: string;
  proofLink?: string;
  note?: string;
  timestamp: number;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  creditedTxId?: string;
}
