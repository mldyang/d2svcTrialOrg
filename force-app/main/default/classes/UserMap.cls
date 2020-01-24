/**
  * The `UserMap` is a class that's used in the object components to create the User Mapping UI.
  *
  * @author Thomas Stachl <tstachl@salesforce.com>
  * @version 0.1
  * @license BSD 3-Clause
  */
public class UserMap { 
  /**
    * Contains the id of the User.
    */
  @AuraEnabled
  public Long id;

  /**
    * Contains the name of the User.
    */
  @AuraEnabled
  public String name;

  /**
    * Contains the email of the User.
    */
  @AuraEnabled
  public String email;

  /**
    * Contains the value of the User.
    */
  @AuraEnabled
  public String value;

  /**
    * Does this user need to be active?
    */
  @AuraEnabled
  public Boolean active = false;

  /**
    * Does this user need to be created?
    */
  @AuraEnabled
  public Boolean create = false;

  /**
   * Instantiates a new UserMap
   * @param Long id The id of the user
   * @param String name The name of the user
   * @param String email The email of the user
   */
  public UserMap(Long id, String name, String email) {
    this(id, name, email, null, false, false);
  }

  /**
   * Instantiates a new UserMap
   * @param Long id The id of the user
   * @param String name The name of the user
   * @param String email The email of the user
   * @param String value The salesforce id of the user
   * @param Boolean active Is this an active user?
   * @param Boolean create Does the user need to be created?
   */
  public UserMap(Long id, String name, String email, String value, Boolean active, Boolean create) {
    this.id     = id;
    this.name   = name;
    this.email  = email;
    this.value  = value;
    this.active = active;
    this.create = create;
  }

  /**
   * Build User SObject
   * @return User
   */
  public User buildUser() {
    String[] name = this.name.split('\\s');
    String lastName = name.remove(name.size() - 1); // remove the last element
    String firstName = String.join(name, ' ');
    String[] uname  = this.email.split('@');

    return new User(
      FirstName = firstName,
      LastName = lastName,
      Alias = lastName.toLowerCase().left(8),
      Username = uname[0] + String.valueOf(Datetime.now().getTime()) + '@' + uname[1],
      Email = this.email,
      /*LocaleSidKey = MigrationStepController.CURRENT_ORG.DefaultLocaleSidKey,
      LanguageLocaleKey = MigrationStepController.CURRENT_ORG.LanguageLocaleKey,
      EmailEncodingKey = 'UTF-8',
      TimeZoneSidKey = MigrationStepController.CURRENT_USER.TimeZoneSidKey,
      ProfileId = MigrationStepController.STANDARD_PROFILE.Id,*/
      IsActive = this.active
    );
  }

  /**
   * Creating all the users specified in the Mapping Interface.
   *
   * @param List<UserMap> users The mapped users.
   * @return List<UserMap> Mapped users.
   */
  public static List<UserMap> createUsers(List<UserMap> users) {
    List<User> usrList = new List<User>();
    for (UserMap u : users) {
      // check if we have to create the user
      if (u.create) {
        usrList.add(u.buildUser());
      }
    }

    // If users need to be created, we run through the list of created users
    // and find the corresponding user to assign the Id as value.
    if (usrList.size() > 0) {
      insert usrList;
      for (User u : usrList) {
        for (UserMap user : users) {
          if (user.email == u.Email) {
            user.value = u.Id;
          }
        }
      }
    }

    return users;
  }
}