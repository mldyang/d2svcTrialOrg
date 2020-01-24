/*
 * Copyright (c) 2018, Salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/**
  * The `GroupMap` is a class that's used in the object components to create the Group Mapping UI.
  */
public class GroupMap {
  /**
    * Contains the id of the Group.
    */
  @AuraEnabled
  public Long id;

  /**
    * Contains the name of the Group.
    */
  @AuraEnabled
  public String name;

  /**
    * Contains the value of the Group.
    */
  @AuraEnabled
  public String value;

  /**
    * Does this group need to be created?
    */
  @AuraEnabled
  public Boolean create = false;

  /**
   * Instantiates a new GroupMap
   * @param Long id The id of the group
   * @param String name The name of the group
   */
  public GroupMap(Long id, String name) {
    this(id, name, false);
  }

  /**
   * Instantiates a new GroupMap
   * @param Long id The id of the group
   * @param String name The name of the group
   * @param Boolean create Do we create the group?
   */
  public GroupMap(Long id, String name, Boolean create) {
    this.id     = id;
    this.name   = name;
    this.create = create;
  }

  /**
   * Generate a developer name based on the name + id
   *
   * @return String Developer name based on name + id
   */
  public String getDeveloperName() {
    return this.name + '_' + String.valueOf(this.id);
  }

  /**
   * Creating all the groups specified in the Mapping Interface.
   *
   * @param List<GroupMap> groups The mapped groups.
   * @return List<GroupMap> Mapped groups.
   */
  public static List<GroupMap> createGroups(List<GroupMap> groups) {
    // list of groups that need to be created
    List<Group> groupList = new List<Group>();
    // list of queues that need to be created
    List<QueueSObject> qSObject = new List<QueueSObject>();
    // map of group name to queue Id
    Map<String, Id> groupNameToQueueMap = new Map<String, Id>();

    for (GroupMap g : groups) {
      // check if we have to create the group
      if (g.create) {
        groupList.add(new Group(Name = g.name, DeveloperName = g.getDeveloperName(), Type = 'Queue'));
      }
    }

    // if we have groups that need to be created -> create them
    if (groupList.size() > 0) {
      insert groupList;

      // for groups that have been created -> create a QueueSObject
      for (Group g : groupList) {
        qSObject.add(new QueueSObject(QueueId = g.Id, SObjectType = 'Case'));
      }
      insert qSObject;

      // for QueueSObject that have been created -> map the Group Name to the QueueSObject
      for (QueueSObject qso : qSObject) {
        for (Group g : groupList) {
          if (g.Id == qso.QueueId) {
            groupNameToQueueMap.put(g.DeveloperName, qso.Id);
          }
        }
      }

      // update the Group Map with the QueueSObject Id
      for (GroupMap g : groups) {
        g.value = groupNameToQueueMap.get(g.getDeveloperName());
      }
    }

    return groups;
  }
}