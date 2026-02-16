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
import Migration "migration";

(with migration = Migration.run)
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
    lastWeightUpdate : ?Time.Time;
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

  public type SwitchMemberInput = {
    whatsappPhone : Text;
  };

  public type UpdateWeightInput = {
    memberId : Text;
    newWeight : Float;
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

  func isCoachStaff(caller : Principal) : Bool {
    let accessRole = AccessControl.getUserRole(accessControlState, caller);
    if (accessRole != #user and accessRole != #admin) {
      return false;
    };
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        profile.role == #coach or profile.role == #assistantCoach;
      };
    };
  };

  func isAdmin(caller : Principal) : Bool {
    AccessControl.getUserRole(accessControlState, caller) == #admin;
  };

  func isMemberOwner(caller : Principal, memberId : Text) : Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      return false;
    };
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
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
    validateUserProfile(profile);
    userProfiles.add(caller, profile);
  };

  func validateUserProfile(profile : UserProfile) {
    switch (profile.role) {
      case (#coach or #assistantCoach) {};
      case (#member) {
        if (profile.memberId == null) {
          Runtime.trap("Invalid profile: Members must have a memberId");
        };
      };
    };
  };

  public shared ({ caller }) func switchMember(params : SwitchMemberInput) : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can switch member association");
    };
    let memberOpt = findMemberByPhone(params.whatsappPhone);
    switch (memberOpt) {
      case (null) { Runtime.trap("Member not found for provided phone number") };
      case (?member) {
        let newProfile : UserProfile = {
          name = member.name;
          role = #member;
          memberId = ?member.id;
        };
        userProfiles.add(caller, newProfile);
        ?newProfile;
      };
    };
  };

  func findMemberByPhone(phone : Text) : ?MemberProfile {
    membersMap.values().toArray().find(func(m) { Text.equal(m.whatsappPhone, phone) });
  };

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

  public shared ({ caller }) func updateCurrentWeight(input : UpdateWeightInput) : async () {
    if (not isMemberOwner(caller, input.memberId)) {
      Runtime.trap(
        "Unauthorized: Can only update your own weight"
      );
    };

    switch (membersMap.get(input.memberId)) {
      case (null) { Runtime.trap("Member profile not found") };
      case (?profile) {
        let updatedProfile = {
          profile with
          currentWeight = input.newWeight;
          lastWeightUpdate = ?Time.now();
        };
        membersMap.add(input.memberId, updatedProfile);
      };
    };
  };

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

  public shared ({ caller }) func submitDailyCheckin(checkin : DailyCheckin) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    if (not isMemberOwner(caller, checkin.memberId)) {
      Runtime.trap("Unauthorized: Can only submit check-ins for your own profile");
    };
    dailyCheckinsMap.add(checkin.id, checkin);
  };

  public shared ({ caller }) func submitWeeklyCheckin(checkin : WeeklyCheckin) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    if (not isMemberOwner(caller, checkin.memberId)) {
      Runtime.trap("Unauthorized: Can only submit check-ins for your own profile");
    };
    weeklyCheckinsMap.add(checkin.id, checkin);

    switch (membersMap.get(checkin.memberId)) {
      case (null) { Runtime.trap("Member profile not found") };
      case (?profile) {
        let updatedProfile = {
          profile with
          currentWeight = checkin.weight;
          lastWeightUpdate = ?Time.now();
        };
        membersMap.add(checkin.memberId, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func createFollowupTask(task : FollowupTask) : async () {
    if (not isCoachStaff(caller) and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only coaches and admins can create follow-up tasks");
    };
    followupTasksMap.add(task.id, task);
  };

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

  public shared ({ caller }) func addCoachNote(note : CoachNote) : async () {
    if (not isCoachStaff(caller) and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only coaches and admins can add coach notes");
    };
    coachNotesMap.add(note.id, note);
  };

  public shared ({ caller }) func logMessage(log : MessageLog) : async () {
    if (not isCoachStaff(caller) and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only coaches and admins can log messages");
    };
    messageLogsMap.add(log.id, log);
  };

  public shared ({ caller }) func createAnnouncement(announcement : Announcement) : async () {
    if (not isCoachStaff(caller) and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only coaches and admins can create announcements");
    };
    announcementsMap.add(announcement.id, announcement);
  };

  public query ({ caller }) func getAllMembers() : async [MemberProfile] {
    if (not isCoachStaff(caller) and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only coaches and admins can view all members");
    };
    membersMap.values().toArray().sort();
  };

  public query ({ caller }) func getAllDailyCheckins() : async [DailyCheckin] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    let allCheckins = dailyCheckinsMap.values().toArray();
    if (isCoachStaff(caller) or isAdmin(caller)) {
      return allCheckins.sort();
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
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

  public query ({ caller }) func getAllWeeklyCheckins() : async [WeeklyCheckin] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    let allCheckins = weeklyCheckinsMap.values().toArray();
    if (isCoachStaff(caller) or isAdmin(caller)) {
      return allCheckins.sort();
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
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

  public query ({ caller }) func getAllFollowupTasks() : async [FollowupTask] {
    if (not isCoachStaff(caller) and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only coaches and admins can view follow-up tasks");
    };
    followupTasksMap.values().toArray().sort();
  };

  public query ({ caller }) func getAllCoachNotes() : async [CoachNote] {
    if (not isCoachStaff(caller) and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only coaches and admins can view coach notes");
    };
    coachNotesMap.values().toArray().sort();
  };

  public query ({ caller }) func getAllMessageLogs() : async [MessageLog] {
    if (not isCoachStaff(caller) and not isAdmin(caller)) {
      Runtime.trap("Unauthorized: Only coaches and admins can view message logs");
    };
    messageLogsMap.values().toArray().sort();
  };

  public query ({ caller }) func getAllAnnouncements() : async [Announcement] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    let allAnnouncements = announcementsMap.values().toArray();
    if (isCoachStaff(caller) or isAdmin(caller)) {
      return allAnnouncements.sort();
    };
    allAnnouncements.filter<Announcement>(func(a) { a.published }).sort();
  };

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
