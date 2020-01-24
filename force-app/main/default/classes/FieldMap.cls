/**
  * The `FieldMap` is a class that's used in the object components to create the Field Mapping UI.
  *
  * @author Thomas Stachl <tstachl@salesforce.com>
  * @version 0.1
  * @license BSD 3-Clause
  */
public class FieldMap {
  /**
    * Contains the label of the Field.
    */
  @AuraEnabled
  public String label;

  /**
    * Contains the field name.
    */
  @AuraEnabled
  public String name;

  /**
    * Contains the type: string, textarea, richtextarea, boolean, datetime, integer, picklist.
    */
  @AuraEnabled
  public String type;

  /**
    * Contains the description of the field to be displayed in a tooltip.
    */
  @AuraEnabled
  public String description;

  /**
    * Contains the API name of the premapped fields. If this is specified the mapping can't be changed.
    */
  @AuraEnabled
  public String value;

  /**
    * Makes the field required in the UI.
    */
  @AuraEnabled
  public Boolean required = false;

  /**
    * Makes the field required in the UI.
    */
  @AuraEnabled
  public Boolean readonly = false;

  /**
    * Does this field need to be created.
    */
  @AuraEnabled
  public Boolean create = false;

  /**
    * In case of a list field we have options that need to be mapped.
    */
  @AuraEnabled
  public Map<String, String> options;

  /**
   * Instantiates a new FieldMap
   * @param String name The name of the field
   * @param String type The field type to be used
   */
  public FieldMap(String name, String type) {
    this(name, type, null, null, false, false, false, null);
  }

  /**
    * Instantiates a new FieldMap
    * @param String name The name of the field
    * @param String type The field type to be used
    * @param String description The description to be used
    */
  public FieldMap(String name, String type, String description) {
    this(name, type, description, null, false, false, false, null);
  }

  /**
   * Instantiates a new FieldMap
   * @param String name The name of the field
   * @param String type The field type to be used
   * @param String description The description to be used
   * @param Map<String, String> options The options map to use.
   */
  public FieldMap(String name, String type, String description, Map<String, String> options) {
    this(name, type, description, null, false, false, false, options);
  }

  /**
    * Instantiates a new FieldMap
    * @param String name The name of the field
    * @param String type The field type to be used
    * @param String description The description to be used
    * @param String value The API name of the pre mapped field
    */
  public FieldMap(String name, String type, String description, String value) {
    this(name, type, description, value, false, false, false, null);
  }

  /**
    * Instantiates a new FieldMap
    * @param String name The name of the field
    * @param String type The field type to be used
    * @param String description The description to be used
    * @param Boolean required Is the field required?
    */
  public FieldMap(String name, String type, String description, Boolean required) {
    this(name, type, description, null, required, false, false, null);
  }

  /**
    * Instantiates a new FieldMap
    * @param String name The name of the field
    * @param String type The field type to be used
    * @param String description The description to be used
    * @param Boolean required Is the field required?
    * @param Boolean create Is the field supposed to be created?
    */
  public FieldMap(String name, String type, String description, Boolean required, Boolean create) {
    this(name, type, description, null, required, false, create, null);
  }

  /**
    * Instantiates a new FieldMap
    * @param String name The name of the field
    * @param String type The field type to be used
    * @param String description The description to be used
    * @param String value The field is mapped to a field
    * @param Boolean required Is the field required?
    * @param Boolean readonly Is the field readonly?
    * @param Boolean create Is the field supposed to be created?
    */
  public FieldMap(String name, String type, String description, String value, Boolean required, Boolean readonly, Boolean create) {
    this(name, type, description, value, required, readonly, create, null);
  }

  /**
   * Instantiates a new FieldMap
   * @param String name The name of the field
   * @param String type The field type to be used
   * @param String description The description to be used
   * @param String value The field type to be used
   * @param Map<String, String> options The options map to use.
   */
  public FieldMap(String name, String type, String description, String value, Map<String, String> options) {
    this(name, type, description, value, false, false, false, options);
  }

  /**
    * Instantiates a new FieldMap
    * @param String name The name of the field
    * @param String type The field type to be used
    * @param String description The description to be used
    * @param String value The field is mapped to a field
    * @param Boolean required Is the field required?
    * @param Boolean readonly Is the field readonly?
    * @param Boolean create Is the field supposed to be created?
    * @param Map<String, String> options The options for the field.
    */
  public FieldMap(String name, String type, String description, String value, Boolean required, Boolean readonly, Boolean create, Map<String, String> options) {
    this(name, null, type, description, value, required, readonly, create, options);
    this.label = humanize(name);
  }

  /**
   * Instantiates a new FieldMap
   * @param String name The name of the field
   * @param String label The label of the field
   * @param String type The field type to be used
   * @param String description The description to be used
   * @param String value The field is mapped to a field
   * @param Boolean required Is the field required?
   * @param Boolean readonly Is the field readonly?
   * @param Boolean create Is the field supposed to be created?
   * @param Map<String, String> options The options for the field.
   */
  public FieldMap(String name, String label, String type, String description, String value, Boolean required, Boolean readonly, Boolean create, Map<String, String> options) {
    this.name        = name;
    this.label       = label;
    this.description = description;
    this.type        = type;
    this.value       = value;
    this.required    = required;
    this.readonly    = readonly;
    this.create      = create;
    this.options     = options;
  }

  /**
   * Returns a map of all the properties defined in this object.
   */
  public Map<String, Object> toMap() {
    return new Map<String, Object>{
      'name' => this.name,
      'label' => this.label,
      'type' => this.type,
      'value' => this.value,
      'required' => this.required,
      'readonly' => this.readonly,
      'create' => this.create,
      'options' => this.options
    };
  }

  /**
    * Private method to humanize a name for the label.
    * @param String str String to humanize.
    * @return String
    */
  private String humanize(String str) {
    List<String> strl = str.split('_');
    for (Integer i = 0; i < strl.size(); i++) {
      strl.set(i, strl.get(i).capitalize());
    }
    return String.join(strl, ' ');
  }

  /**
   * Article Field Map
   */
  public static List<FieldMap> ARTICLE_MAP = new List<FieldMap>{
    new FieldMap('subject', 'string', 'Subject of the article.', 'Title', true, true, false),
    new FieldMap('body', 'richtextarea', 'Body of the content. Maps to rich text area fields.', true, true),
    new FieldMap('in_support_center', 'boolean', 'True/False value if the article is displayed in the Support Center.'),
    new FieldMap('body_email', 'longtextarea', 'This field is often used to populate the article text into cases. If you use macros that insert articles into cases, please map this field.'),
    new FieldMap('keywords', 'textarea', 'List of keywords for Support Center search queries.'),
    new FieldMap('quickcode', 'string', 'Classic Agent feature to insert article text into cases.'),
    new FieldMap('published_at', 'datetime', 'The last date that the article was set to In Support Center.'),
    new FieldMap('created_at', 'datetime', 'The date the article was created.'),
    new FieldMap('updated_at', 'datetime', 'The date of the last update made to the article.'),
    new FieldMap('rating', 'integer', 'The percentage of people who found the article helpful.'),
    new FieldMap('rating_count', 'integer', 'The number of ratings given to the article.'),
    new FieldMap('rating_score', 'integer', 'The number of people who found the article helpful.'),
    new FieldMap('public_url', 'string', 'The publicly accessible URL for the Desk article.'),
    new FieldMap('internal_notes', 'longtextarea', 'Note field for the article.')
  };

  /**
   * Account Field Map
   */
  public static List<FieldMap> ACCOUNT_MAP = new List<FieldMap>{
    new FieldMap('name', 'string', '', 'Name', true, true, false),
    new FieldMap('domains', 'longtextarea', ''),
    new FieldMap('created_at', 'datetime', ''),
    new FieldMap('updated_at', 'datetime', ''),
    new FieldMap('external_id', 'string', '')
  };

  /**
   * Contact Field Map
   */
  public static List<FieldMap> CONTACT_MAP = new List<FieldMap>{
    new FieldMap('first_name', 'string', '', 'FirstName'),
    new FieldMap('last_name', 'string', '', 'LastName', true, true, false),
    new FieldMap('title', 'string', '', 'Title'),
    new FieldMap('created_at', 'datetime', ''),
    new FieldMap('updated_at', 'datetime', ''),
    new FieldMap('external_id', 'string', ''),
    // new FieldMap('uid', 'string'), // Multipass SSO UID
    new FieldMap('background', 'longtextarea', ''),
    new FieldMap('language', 'string', ''),
    new FieldMap('access_private_portal', 'boolean', ''),
    new FieldMap('access_company_cases', 'boolean', '')
  };

  /**
   * Case Field Map
   */
  public static List<FieldMap> CASE_MAP = new List<FieldMap>{
    new FieldMap('subject', 'string', '', 'Subject', true, true, false),
    new FieldMap('priority', 'picklist', '', 'Priority', new Map<String, String>{
      '1' => 'Low',
      '2' => 'Low',
      '3' => 'Low',
      '4' => 'Medium',
      '5' => 'Medium',
      '6' => 'Medium',
      '7' => 'Medium',
      '8' => 'High',
      '9' => 'High',
      '10' => 'High'
    }),
    new FieldMap('description', 'longtextarea', ''),
    new FieldMap('status', 'picklist', '', 'Status', new Map<String, String>{
      'new' => 'New',
      'open' => 'Open',
      'pending' => 'Pending',
      'resolved' => 'Closed',
      'closed' => 'Closed',
      'deleted' => 'Closed'
    }),
    new FieldMap('type', 'picklist', '', 'Origin', new Map<String, String>{
      'chat' => 'Phone',
      'twitter' => 'Phone',
      'email' => 'Email',
      'qna' => 'Phone',
      'facebook' => 'Phone',
      'phone' => 'Phone'
    }),
    new FieldMap('labels', 'longtextarea', ''),
    new FieldMap('language', 'string', ''),
    new FieldMap('external_id', 'string', ''),
    new FieldMap('created_at', 'datetime', ''),
    new FieldMap('updated_at', 'datetime', ''),
    new FieldMap('changed_at', 'datetime', ''),
    new FieldMap('active_at', 'datetime', ''),
    new FieldMap('received_at', 'datetime', ''),
    new FieldMap('first_opened_at', 'datetime', ''),
    new FieldMap('opened_at', 'datetime', ''),
    new FieldMap('first_resolved_at', 'datetime', ''),
    new FieldMap('resolved_at', 'datetime', '')
  };

  public class ReservedField {
    /**
     * Contains the field name.
     */
    @AuraEnabled
    public String name;

    /**
     * Contains the field that it is pre-mapped to. This will exclude it from being excluded from that field's options
     */
    @AuraEnabled
    public String mappedField;

    public ReservedField(String name, String mappedField) {
      this.name      = name;
      this.mappedField = mappedField;
    }
  }
  /**
   * Article Reserved Field Map
   * -Used for excluding fields from the mapping
   */
  public static List<ReservedField> ARTICLE_RESERVED_MAP = new List<ReservedField>{
    new ReservedField('title', 'subject'),
    new ReservedField('urlname', null),
    new ReservedField('desk_article_id__c', null)
  };

}