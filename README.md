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
[isMultiple]|boolean|false|can add multiple option from options to model array
[isObjectValue]|boolean|false|sets the model the whole option object
[isLoading]|boolean|false|is waiting for async call

## Available events
|Event|returns|Description
|-|-|-
(modelChange)|object|The changed model
(inputChange)|string|When the filter input text changes
