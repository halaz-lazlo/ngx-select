# ngx-select

Select module for angular 2-4

## Usage in existing angular cli project
2. Import module
```
import {NgxSelectModule} from 'ng-select';
imports: [..., NgxSelectModule, ...]
```

3. Use
```
<ngx-select [options]="..." [(model)]="..."></ngx-select>
```

## Available options
| Attribute        | Type           | Default  | Description |
|-|-|-|-|
|model|any|undefined|the ngModel
options|object[]|undefined|The options shown in dropdown
valueField|string|value|The value field of option
labelField|string|label|The label field of option
isMultiple|boolean|false|can add multiple option from options to model array
isObjectValue|boolean|false|sets the model the whole option object
isLoading|boolean|false|is waiting for async call
