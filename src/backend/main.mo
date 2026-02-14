import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Blob "mo:core/Blob";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type UserRole = {
    #coach;
    #assistantCoach;
    #member;
  };

  type ReminderPreference = {
    #daily;
    #weekly;
    #both;
    #none;
  };

  type Gender = {
    #male;
    #female;
    #other;
  };

  type ConsentStatus = {
    #active;
    #optedOut;
    #pending;
  };

  public type MemberProfile = {
    id : Text;
    name : Text;
    age : Nat;
    gender : Gender;
    heightCm : Float;
    whatsappPhone : Text;
    startingWeight : Float;
    currentWeight : Float;
    waistCircumference : ?Float;
    hipCircumference : ?Float;
    chestCircumference : ?Float;
    targetWeight : ?Float;
    targetDate : ?Time.Time;
    programType : Text;
    trfWindowStart : ?Time.Time;
    trfWindowEnd : ?Time.Time;
    noSnacks : Bool;
    reminderPreference : ReminderPreference;
    consentStatus : ConsentStatus;
    consentTimestamp : ?Time.Time;
  };

  public type DailyCheckin = {
    id : Text;
    memberId : Text;
    date : Time.Time;
    waterIntake : Float;
    workoutMinutes : Nat;
    steps : Nat;
    sleepHours : Float;
    moodScore : Nat;
    digestionScore : Nat;
    complianceScore : Nat;
    notes : ?Text;
  };

  public type WeeklyCheckin = {
    id : Text;
    memberId : Text;
    date : Time.Time;
    weight : Float;
    waist : ?Float;
    hip : ?Float;
    chest : ?Float;
    photos : ?Storage.ExternalBlob;
    wins : ?Text;
    struggles : ?Text;
  };

  type TaskStatus = {
    #dueToday;
    #overdue;
    #completed;
  };

  type FollowupTask = {
    id : Text;
    memberId : Text;
    description : Text;
    status : TaskStatus;
    dueDate : Time.Time;
    completionDate : ?Time.Time;
    coachNoteId : ?Text;
  };

  type CoachNote = {
    id : Text;
    memberId : Text;
    content : Text;
    timestamp : Time.Time;
  };

  type MessageLog = {
    id : Text;
    memberId : Text;
    templateId : Text;
    status : Text;
    timestamp : Time.Time;
    providerMessageId : ?Text;
  };

  type Announcement = {
    id : Text;
    title : Text;
    content : Text;
    image : ?Storage.ExternalBlob;
    targetSegment : Text;
    scheduledTime : ?Time.Time;
    published : Bool;
  };

  public type UserProfile = {
    name : Text;
    role : UserRole;
    memberId : ?Text;
  };

  let membersMap = Map.empty<Text, MemberProfile>();
  let dailyCheckinsMap = Map.empty<Text, DailyCheckin>();
  let weeklyCheckinsMap = Map.empty<Text, WeeklyCheckin>();
  let followupTasksMap = Map.empty<Text, FollowupTask>();
  let coachNotesMap = Map.empty<Text, CoachNote>();
  let messageLogsMap = Map.empty<Text, MessageLog>();
  let announcementsMap = Map.empty<Text, Announcement>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  module MemberProfile {
    public func compare(profile1 : MemberProfile, profile2 : MemberProfile) : Order.Order {
      Text.compare(profile1.id, profile2.id);
    };
  };

  module DailyCheckin {
    public func compare(checkin1 : DailyCheckin, checkin2 : DailyCheckin) : Order.Order {
      Text.compare(checkin1.id, checkin2.id);
    };
  };

  module WeeklyCheckin {
    public func compare(checkin1 : WeeklyCheckin, checkin2 : WeeklyCheckin) : Order.Order {
      Text.compare(checkin1.id, checkin2.id);
    };
  };

  module FollowupTask {
    public func compare(task1 : FollowupTask, task2 : FollowupTask) : Order.Order {
      Text.compare(task1.id, task2.id);
    };
  };

  module CoachNote {
    public func compare(note1 : CoachNote, note2 : CoachNote) : Order.Order {
      Text.compare(note1.id, note2.id);
    };
  };

  module MessageLog {
    public func compare(log1 : MessageLog, log2 : MessageLog) : Order.Order {
      Text.compare(log1.id, log2.id);
    };
  };

  module Announcement {
    public func compare(announcement1 : Announcement, announcement2 : Announcement) : Order.Order {
      Text.compare(announcement1.id, announcement2.id);
    };
  };

  // Helper function to check if caller is coach staff (coach or assistantCoach)
  // Requires both AccessControl authentication AND custom role check
  func isCoachStaff(caller : Principal) : Bool {
    // Must be authenticated as user or admin in AccessControl
    let accessRole = AccessControl.getUserRole(accessControlState, caller);
    if (accessRole != #user and accessRole != #admin) {
      return false;
    };
    
    // Must have coach or assistantCoach role in UserProfile
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        profile.role == #coach or profile.role == #assistantCoach;
      };
    };
  };

  // Helper function to check if caller is admin
  // Admins have full access regardless of UserProfile role
  func isAdmin(caller : Principal) : Bool {
    AccessControl.getUserRole(accessControlState, caller) == #admin;
  };

  // Helper function to check if caller owns the member profile
  func isMemberOwner(caller : Principal, memberId : Text) : Bool {
    // Must be authenticated
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      return false;
    };
    
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        // Only members can own member profiles
        if (profile.role != #member) {
          return false;
        };
        switch (profile.memberId) {
          case (null) { false };
          case (?id) { id == memberId };
        };
      };
    };
  };

  // User profile management (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    
    // Validate role consistency with AccessControl
    let accessRole = AccessControl.getUserRole(accessControlState, caller);
    switch (profile.role) {
      case (#coach or #assistantCoach) {
        // Coach staff must be at least #user in AccessControl
        if (accessRole == #guest) {
          Runtime.trap("Invalid role: Coach staff must have user or admin access level");
        };
      };
      case (#member) {
        // Members must be #user in AccessControl
        if (accessRole != #user) {
          Runtime.trap("Invalid role: Members must have user access level");
        };
        // Members must have a memberId
        if (profile.memberId == null) {
          Runtime.trap("Invalid profile: Members must have a memberId");
        };
      };
    };
    
    userProfiles.add(caller, profile);
  };

  // Member profile management - only coaches/admins can create/update
  public shared ({ caller }) func createMemberProfile(profile : MemberProfile) : async () {
    if (not isCoachStaff(caller) and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only coaches and admins can create member profiles");
    };
    membersMap.add(profile.id, profile);
  };

  public shared ({ caller }) func updateMemberProfile(id : Text, profile : MemberProfile) : async () {
    if (not isCoachStaff(caller) and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only coaches and admins can update member profiles");
    };
    if (not membersMap.containsKey(id)) {
      Runtime.trap("Member profile not found");
    };
    membersMap.add(id, profile);
  };

  // Members can view their own profile, coaches/admins can view any profile
  public query ({ caller }) func getMemberProfile(id : Text) : async MemberProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    if (not (isCoachStaff(caller) or isAdmin(caller) or isMemberOwner(caller, id))) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    switch (membersMap.get(id)) {
      case (null) { Runtime.trap("Member profile not found") };
      case (?profile) { profile };
    };
  };

  // Daily check-in - only the member can submit their own check-in
  public shared ({ caller }) func submitDailyCheckin(checkin : DailyCheckin) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    if (not isMemberOwner(caller, checkin.memberId)) {
      Runtime.trap("Unauthorized: Can only submit check-ins for your own profile");
    };

    dailyCheckinsMap.add(checkin.id, checkin);
  };

  // Weekly check-in - only the member can submit their own check-in
  public shared ({ caller }) func submitWeeklyCheckin(checkin : WeeklyCheckin) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    if (not isMemberOwner(caller, checkin.memberId)) {
      Runtime.trap("Unauthorized: Can only submit check-ins for your own profile");
    };

    weeklyCheckinsMap.add(checkin.id, checkin);
  };

  // Follow-up tasks - coaches and admins can create
  public shared ({ caller }) func createFollowupTask(task : FollowupTask) : async () {
    if (not isCoachStaff(caller) and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only coaches and admins can create follow-up tasks");
    };
    followupTasksMap.add(task.id, task);
  };

  // Update task status - coaches and admins only
  public shared ({ caller }) func updateTaskStatus(id : Text, status : TaskStatus) : async () {
    if (not isCoachStaff(caller) and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only coaches and admins can update task status");
    };
    switch (followupTasksMap.get(id)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        let updatedTask = { task with status };
        followupTasksMap.add(id, updatedTask);
      };
    };
  };

  // Coach notes - coaches and admins only
  public shared ({ caller }) func addCoachNote(note : CoachNote) : async () {
    if (not isCoachStaff(caller) and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only coaches and admins can add coach notes");
    };
    coachNotesMap.add(note.id, note);
  };

  // Message logging - coaches and admins only
  public shared ({ caller }) func logMessage(log : MessageLog) : async () {
    if (not isCoachStaff(caller) and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only coaches and admins can log messages");
    };
    messageLogsMap.add(log.id, log);
  };

  // Announcements - only admins and coaches can create
  public shared ({ caller }) func createAnnouncement(announcement : Announcement) : async () {
    if (not isCoachStaff(caller) and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only coaches and admins can create announcements");
    };
    announcementsMap.add(announcement.id, announcement);
  };

  // Get all members - coaches/admins only
  public query ({ caller }) func getAllMembers() : async [MemberProfile] {
    if (not isCoachStaff(caller) and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only coaches and admins can view all members");
    };
    membersMap.values().toArray().sort();
  };

  // Get all daily check-ins - coaches/admins can see all, members see only their own
  public query ({ caller }) func getAllDailyCheckins() : async [DailyCheckin] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let allCheckins = dailyCheckinsMap.values().toArray();

    if (isCoachStaff(caller) or isAdmin(caller)) {
      return allCheckins.sort();
    };

    // Filter to only member's own check-ins
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        // Only members should reach this point
        if (profile.role != #member) {
          Runtime.trap("Invalid access: Non-members cannot view check-ins");
        };
        switch (profile.memberId) {
          case (null) { Runtime.trap("No member ID associated with user") };
          case (?memberId) {
            allCheckins.filter<DailyCheckin>(func(c) { c.memberId == memberId }).sort();
          };
        };
      };
    };
  };

  // Get all weekly check-ins - coaches/admins can see all, members see only their own
  public query ({ caller }) func getAllWeeklyCheckins() : async [WeeklyCheckin] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let allCheckins = weeklyCheckinsMap.values().toArray();

    if (isCoachStaff(caller) or isAdmin(caller)) {
      return allCheckins.sort();
    };

    // Filter to only member's own check-ins
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        // Only members should reach this point
        if (profile.role != #member) {
          Runtime.trap("Invalid access: Non-members cannot view check-ins");
        };
        switch (profile.memberId) {
          case (null) { Runtime.trap("No member ID associated with user") };
          case (?memberId) {
            allCheckins.filter<WeeklyCheckin>(func(c) { c.memberId == memberId }).sort();
          };
        };
      };
    };
  };

  // Get all follow-up tasks - coaches/admins only
  public query ({ caller }) func getAllFollowupTasks() : async [FollowupTask] {
    if (not isCoachStaff(caller) and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only coaches and admins can view follow-up tasks");
    };
    followupTasksMap.values().toArray().sort();
  };

  // Get all coach notes - coaches/admins only
  public query ({ caller }) func getAllCoachNotes() : async [CoachNote] {
    if (not isCoachStaff(caller) and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only coaches and admins can view coach notes");
    };
    coachNotesMap.values().toArray().sort();
  };

  // Get all message logs - coaches/admins only
  public query ({ caller }) func getAllMessageLogs() : async [MessageLog] {
    if (not isCoachStaff(caller) and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only coaches and admins can view message logs");
    };
    messageLogsMap.values().toArray().sort();
  };

  // Get all announcements - members see published ones, coaches/admins see all
  public query ({ caller }) func getAllAnnouncements() : async [Announcement] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let allAnnouncements = announcementsMap.values().toArray();

    if (isCoachStaff(caller) or isAdmin(caller)) {
      return allAnnouncements.sort();
    };

    // Members only see published announcements
    allAnnouncements.filter<Announcement>(func(a) { a.published }).sort();
  };

  // Complete task - coaches and admins only
  public shared ({ caller }) func completeTask(id : Text) : async () {
    if (not isCoachStaff(caller) and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only coaches and admins can complete tasks");
    };
    switch (followupTasksMap.get(id)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        let updatedTask = {
          task with
          status = #completed;
          completionDate = ?Time.now();
        };
        followupTasksMap.add(id, updatedTask);
      };
    };
  };
};
