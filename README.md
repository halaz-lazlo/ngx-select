# ngx-select

Select module for angular 2-4

[DEMO](https://halaz-lazlo.github.io/ngx-select-demo/)

## Usage in an existing angular cli project
1. Install via npm
```
npm install @halaz.lazlo/ngx-select --save
```

2. Import module
```
// src/app/app.module.ts

import { NgxSelectModule } from '@halaz.lazlo/ngx-select';
imports: [..., NgxSelectModule, ...]
```

3. Use default style
```
// .angular-cli.json

"styles": [
  "../node_modules/@halaz.lazlo/ngx-select/src/ngx-select.component.scss"
]
```

4. OR Import scss
```
// src/scss/main.scss

@import 'node_modules/@halaz.lazlo/ngx-select/src/ngx-select.component';
```

5. Use
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
[maxItems]|number|undefined|If multiple, how many items can be added to array
[isLoading]|boolean|false|Is waiting for async call, a spinner is visible
[placeholder]|string|undefined|The placeholder
[dropdownDirection]|['up', 'down']|down|Which direction the dropdown opens
[noOptionAvailableMsg]|string|No options available, try searching...|When options is empty or not defined
[noFilterResultsMsg]|string|No results|The message shown when no filtered result is found
[allOptionSelectedMsg]|string|All options have been selected|All options have been selected
[addOptionMsg]|string|Add {{input}}...|The message when isMultiple === true, the {{input}} is replaced with the value in the input
[mobileBreakpoint]|number|768|isMobile = screen.width < mobileBreakpoint

## Available events
|Event|Returns|Description
|-|-|-
(modelChange)|object|The changed model
(inputChange)|string|When the filter input text changes
(dropdownOpen)|null|Dropdown open
(dropdownClose)|null|Dropdown close
