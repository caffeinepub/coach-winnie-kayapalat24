import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";

module {
  type OldMemberProfile = {
    id : Text;
    name : Text;
    age : Nat;
    gender : {
      #male;
      #female;
      #other;
    };
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
    reminderPreference : {
      #daily;
      #weekly;
      #both;
      #none;
    };
    consentStatus : {
      #active;
      #optedOut;
      #pending;
    };
    consentTimestamp : ?Time.Time;
  };

  type OldActor = {
    membersMap : Map.Map<Text, OldMemberProfile>;
  };

  type NewMemberProfile = {
    id : Text;
    name : Text;
    age : Nat;
    gender : {
      #male;
      #female;
      #other;
    };
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
    reminderPreference : {
      #daily;
      #weekly;
      #both;
      #none;
    };
    consentStatus : {
      #active;
      #optedOut;
      #pending;
    };
    consentTimestamp : ?Time.Time;
    lastWeightUpdate : ?Time.Time;
  };

  type NewActor = {
    membersMap : Map.Map<Text, NewMemberProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let updatedMembersMap = old.membersMap.map<Text, OldMemberProfile, NewMemberProfile>(
      func(_id, oldProfile) {
        { oldProfile with lastWeightUpdate = null };
      }
    );
    { membersMap = updatedMembersMap };
  };
};
