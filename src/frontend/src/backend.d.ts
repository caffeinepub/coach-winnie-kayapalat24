import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface WeeklyCheckin {
    id: string;
    hip?: number;
    weight: number;
    memberId: string;
    date: Time;
    chest?: number;
    wins?: string;
    struggles?: string;
    waist?: number;
    photos?: ExternalBlob;
}
export interface DailyCheckin {
    id: string;
    memberId: string;
    waterIntake: number;
    date: Time;
    digestionScore: bigint;
    steps: bigint;
    notes?: string;
    moodScore: bigint;
    workoutMinutes: bigint;
    complianceScore: bigint;
    sleepHours: number;
}
export type Time = bigint;
export interface UpdateWeightInput {
    memberId: string;
    newWeight: number;
}
export interface MessageLog {
    id: string;
    status: string;
    memberId: string;
    templateId: string;
    timestamp: Time;
    providerMessageId?: string;
}
export interface MemberProfile {
    id: string;
    age: bigint;
    trfWindowEnd?: Time;
    consentStatus: ConsentStatus;
    heightCm: number;
    lastWeightUpdate?: Time;
    name: string;
    consentTimestamp?: Time;
    noSnacks: boolean;
    reminderPreference: ReminderPreference;
    startingWeight: number;
    waistCircumference?: number;
    targetDate?: Time;
    chestCircumference?: number;
    gender: Gender;
    targetWeight?: number;
    programType: string;
    hipCircumference?: number;
    trfWindowStart?: Time;
    whatsappPhone: string;
    currentWeight: number;
}
export interface Announcement {
    id: string;
    title: string;
    content: string;
    scheduledTime?: Time;
    published: boolean;
    image?: ExternalBlob;
    targetSegment: string;
}
export interface SwitchMemberInput {
    whatsappPhone: string;
}
export interface CoachNote {
    id: string;
    memberId: string;
    content: string;
    timestamp: Time;
}
export interface FollowupTask {
    id: string;
    status: TaskStatus;
    memberId: string;
    completionDate?: Time;
    dueDate: Time;
    description: string;
    coachNoteId?: string;
}
export interface UserProfile {
    memberId?: string;
    name: string;
    role: UserRole;
}
export enum ConsentStatus {
    active = "active",
    pending = "pending",
    optedOut = "optedOut"
}
export enum Gender {
    other = "other",
    female = "female",
    male = "male"
}
export enum ReminderPreference {
    both = "both",
    none = "none",
    daily = "daily",
    weekly = "weekly"
}
export enum TaskStatus {
    completed = "completed",
    dueToday = "dueToday",
    overdue = "overdue"
}
export enum UserRole {
    member = "member",
    assistantCoach = "assistantCoach",
    coach = "coach"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCoachNote(note: CoachNote): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    completeTask(id: string): Promise<void>;
    createAnnouncement(announcement: Announcement): Promise<void>;
    createFollowupTask(task: FollowupTask): Promise<void>;
    createMemberProfile(profile: MemberProfile): Promise<void>;
    getAllAnnouncements(): Promise<Array<Announcement>>;
    getAllCoachNotes(): Promise<Array<CoachNote>>;
    getAllDailyCheckins(): Promise<Array<DailyCheckin>>;
    getAllFollowupTasks(): Promise<Array<FollowupTask>>;
    getAllMembers(): Promise<Array<MemberProfile>>;
    getAllMessageLogs(): Promise<Array<MessageLog>>;
    getAllWeeklyCheckins(): Promise<Array<WeeklyCheckin>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getMemberProfile(id: string): Promise<MemberProfile>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    logMessage(log: MessageLog): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitDailyCheckin(checkin: DailyCheckin): Promise<void>;
    submitWeeklyCheckin(checkin: WeeklyCheckin): Promise<void>;
    switchMember(params: SwitchMemberInput): Promise<UserProfile | null>;
    updateCurrentWeight(input: UpdateWeightInput): Promise<void>;
    updateMemberProfile(id: string, profile: MemberProfile): Promise<void>;
    updateTaskStatus(id: string, status: TaskStatus): Promise<void>;
}
