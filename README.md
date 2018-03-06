# ngx-select

Select module for angular 2-4

## Usage in an existing angular cli project
1. Install via npm
```
npm install @halaz.lazlo/ngx-select --save
```

2. Import module
```
import { NgxSelectModule } from '@halaz.lazlo/ngx-select';
imports: [..., NgxSelectModule, ...]
```

3. Use
```
<ngx-select [options]="..." [(model)]="..."></ngx-select>
```

## Available settings
|Attribute|Type|Default|Description
|-|-|-|-|
[(model)]|any|undefined|the ngModel
[options]|object[]|undefined|The options shown in dropdown
[valueField]|string|value|The value field of option
[labelField]|string|label|The label field of option
[isMultiple]|boolean|false|Multiselect
[allowAdd]|boolean|false|Allows adding new option
[isObjectValue]|boolean|false|Sets the model the whole option object
[isLoading]|boolean|false|Is waiting for async call, a spinner is visible
[placeholder]|string|undefined|The placeholder
[dropdownDirection]|['up', 'down']|down|Which direction the dropdown opens
[noFilterResultsMsg]|string|No results|The message shown when no filtered result is found
[addOptionMsg]|string|Add {{input}}...|The message when isMultiple === true, the {{input}} is replaced with the value in the input

## Available events
|Event|returns|Description
|-|-|-
(modelChange)|object|The changed model
(inputChange)|string|When the filter input text changes
