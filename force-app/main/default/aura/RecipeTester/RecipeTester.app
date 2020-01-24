<aura:application access="Global" extends="force:slds">
    <!-- <c:AddEmailChannel /> -->
     <!--<c:Toast message="hello world" isActive="true" type="warning" link="Continue without verification" linkMessage="bypassVerification"/> -->
     <!-- <c:RecipeList/> -->
    <!-- <aura:dependency resource="c:RecipeList"/> -->
    <!-- <c:EmailRecipe /> -->
    <!-- <c:EmailAutoResponseRecipe /> -->
    <!-- <c:SocialRecipe/> -->
    <!-- <c:RecipeAuthentication />--> 
    <!-- <c:UserRecipe /> -->
    <!-- <c:RecipeWrapper /> -->
    <!-- <c:QueueRecipe /> -->
    <!-- <c:CaseAssignmentByRuleV2 /> -->
    <!-- <c:LabelsRecipe/> -->
    <!-- <c:RecipeAuthentication/> -->
    <!--  <c:AddEmailChannel/> -->
    <!-- <c:TestComponent/> --> 
    <!-- <c:MacrosRecipe/> -->
    <!-- <c:Popover/> -->
    <!-- <c:SupportProcessSimple/> -->
    <!-- <c:Breadcrumb/> -->
    
    <c:MigrateArticlesSimple />
    <!--
    <aura:attribute name="label" type="String" access="public" description="Label for the field." />
    <aura:attribute name="oldValue" type="String" access="public" description="Label for the field." />
    <c:lookup openOnFocus="true" value="{!v.label}" oldValue="" name="a" placeholder="Select a Value" options="[{label:'a',name:'a'},{label:'b',name:'b'}]" iconName="" idVar="label" labelVar="label" iconVar="icon" /> 
	-->
    
   
    <!-- <c:TestComponent/> -->
   
    
    <!--
    <aura:attribute name="options" type="Object[]" default="[
  {
    'label': 'Annual Review',
    'value': 'Annual Review'
  },
  {
    'label': 'Watching Rates',
    'value': 'Watching Rates'
  },
  {
    'label': 'Initial Contact',
    'value': 'Initial Contact'
  },
  {
    'label': 'Application',
    'value': 'Application'
  },
  {
    'label': 'Waiting for Qualifying Documentation',
    'value': 'Waiting for Qualifying Documentation'
  },
  {
    'label': 'Qualifying Documentation Review',
    'value': 'Qualifying Documentation Review'
   }]"/>
    
    <aura:attribute name="selectedItem" type="String[]" default="['Application','Initial Contact']"/>
    
   <c:MultiSelect options="{!v.options}" label="Testing Testing" selectedItems="{!v.selectedItem}" />
  -->
</aura:application>