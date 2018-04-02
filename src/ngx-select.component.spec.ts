import { NgxSelectComponent } from './ngx-select.component';

describe('select', () => {
  let select: NgxSelectComponent;
  let options: Array<any>;

  beforeEach(() => {
    select = new NgxSelectComponent();

    options = [
      {
        id: 'fake-id-1',
        name: 'fake-name-1',
        otherField: 'other-field-value'
      },
      {
        id: 'fake-id-2',
        name: 'fake-name-2',
        otherField: 'other-field-value-2'
      },
      {
        id: 'fake-id-3',
        name: 'fake-name-3',
        otherField: 'other-field-value-3'
      }
    ];

    select.labelField = 'name';
    select.valueField = 'id';
  });

  describe('basic ui', () => {
    it('should open on open', done => {
      select.dropdownOpen.subscribe(() => {
        expect(select.isOpen).toBeTruthy();

        done();
      });

      select.open();
    });

    it('should close on close', done => {
      select.dropdownClose.subscribe(() => {
        expect(select.isOpen).toBeFalsy();

        done();
      });

      select.open();
      select.close();
    });

    it('should open when focused', done => {
      select.dropdownOpen.subscribe(() => {
        expect(select.isOpen).toBeTruthy();

        done();
      });

      select.focus();
    });
  });

  describe('highlight available option', () => {
    it('should open when no options available', () => {
      select.highlightNextOption();

      expect(select.highlightedOptionIndex).toBe(-1);
      expect(select.isOpen).toBeTruthy();

      select.options = options;
      select.ngOnInit();

      select.highlightNextOption();
      expect(select.highlightedOptionIndex).toBe(0);
    });

    it('should open on jumping to prev available option (keyup)', () => {
      select.highlightPrevOption();

      expect(select.isOpen).toBeTruthy();
    });
  });

  describe('available options', () => {
    it('should have as many available options as many options', () => {
      select.options = options;

      select.ngOnInit();

      expect(select.availableOptions.length).toBe(options.length);
      expect(select.availableOptionsMobile.length).toBe(options.length);
    });

    it('should load async elements', () => {
      select.options = options;

      select.ngOnInit();

      select.options = [
        options[1],
        options[2]
      ];

      expect(select.availableOptions.length).toBe(2);
      expect(select.availableOptions[0].data[select.valueField]).toMatch(options[1][select.valueField]);
    });
  });

  describe('filtering', () => {
    beforeEach(() => {
      select.options = options;
      select.ngOnInit();
    });

    it('should emit + open', done => {
      select.inputChange.subscribe(() => {
        expect(select.isOpen).toBeTruthy();
        done();
      });

      select.onInputChange('name-1');
    });

    it('should filter available options', () => {
      select.inputValue = 'fake-name-1';
      select.onInputChange(select.inputValue);

      expect(select.availableOptions.length).toBe(1);
    });

    it('should show no results when no filter result is available', () => {
      select.inputValue = 'fake-name-random';

      select.onInputChange(select.inputValue);

      expect(select.availableOptions.length).toBe(0);
      expect(select.isNoFilterResults).toBeTruthy();

      expect(select.isAddBtnVisible).toBeFalsy();
    });

    it('should show add new btn, when allowAdd and no filter result is available', () => {
      select.inputValue = 'fake-name-random';
      select.allowAdd = true;

      select.onInputChange(select.inputValue);

      expect(select.availableOptions.length).toBe(0);
      expect(select.isAddBtnVisible).toBeTruthy();

      expect(select.isNoFilterResults).toBeFalsy();
    });

    it('should show that all options have been selected', done => {
      select.inputValue = 'fake-name-random';
      select.isMultiple = true;
      select.allowAdd = true;

      select.options.forEach(option => {
        select.selectOption(option);
      });

      setTimeout(() => {
        expect(select.availableOptions.length).toBe(0);
        expect(select.isAllOptionSelected).toBeTruthy();

        done();
      }, 10);
    });
  });

  describe('preload', () => {
    beforeEach(() => {
      select.options = options;
    });

    it('!isMultiple + !isObjectValue', () => {
      select.model = 'fake-id-2';

      select.ngOnInit();

      expect(select.selectedOptions.length).toBe(1);
      expect(select.selectedOptions[0][select.valueField]).toBe('fake-id-2');
    });

    it('!isMultiple + isObjectValue', () => {
      select.isObjectValue = true;

      select.model = {id: 'fake-id-2', name: 'fake-name-2'};

      select.ngOnInit();

      expect(select.selectedOptions.length).toBe(1);
      expect(select.selectedOptions[0][select.valueField]).toBe('fake-id-2');
      expect(select.selectedOptions[0][select.labelField]).toBe('fake-name-2');
    });

    it('isMultiple + !isObjectValue', () => {
      select.isMultiple = true;

      select.model = ['fake-id-2', 'fake-id-3'];

      select.ngOnInit();

      expect(select.selectedOptions.length).toBe(2);
      expect(select.selectedOptions[0][select.valueField]).toBe('fake-id-2');
      expect(select.selectedOptions[0][select.labelField]).toBe('fake-name-2');
      expect(select.selectedOptions[1][select.valueField]).toBe('fake-id-3');
      expect(select.selectedOptions[1][select.labelField]).toBe('fake-name-3');
    });

    it('isMultiple + isObjectValue', () => {
      select.isMultiple = true;
      select.isObjectValue = true;

      select.model = [options[1], options[2]];

      select.ngOnInit();

      expect(select.selectedOptions.length).toBe(2);

      expect(select.selectedOptions[0][select.valueField]).toBe('fake-id-2');
      expect(select.selectedOptions[0][select.labelField]).toBe('fake-name-2');

      expect(select.selectedOptions[1][select.valueField]).toBe('fake-id-3');
      expect(select.selectedOptions[1][select.labelField]).toBe('fake-name-3');
    });

    describe('allowAdd elements', () => {
      beforeEach(() => {
        select.options = options;
        select.allowAdd = true;
      });

      it('!isMultiple + !isObjectValue', () => {
        select.model = 'fake-id-random';

        select.ngOnInit();

        expect(select.selectedOptions.length).toBe(1);
        expect(select.selectedOptions[0][select.valueField]).toBe('fake-id-random');
      });
    });
  });

  describe('selecting', () => {
    beforeEach(() => {
      select.options = options;
      select.ngOnInit();
    });

    describe('!isMultiple', () => {
      it('!isObjectValue => selectedOption[valueField]', done => {
        select.modelChange.subscribe(val => {
          expect(val).toBe(select.options[0][select.valueField]);
          done();
        });

        select.selectOption(select.options[0]);
      });

      it('isObjectValue => selectedOption', done => {
        select.modelChange.subscribe(val => {
          expect(val).toBe(select.options[0]);
          done();
        });

        select.isObjectValue = true;
        select.selectOption(select.options[0]);
      });

      it('should return the whole option object', done => {
        select.modelChange.subscribe(val => {
          expect(val.otherField).toBe(options[0].otherField);
          done();
        });

        select.isObjectValue = true;
        select.selectOption(select.options[0]);
      });

      it('should close when selection', done => {
        select.modelChange.subscribe(val => {
          expect(select.isOpen).toBeFalsy();
          done();
        });

        select.focus();
        select.selectOption(select.options[0]);
      });

      it('should select the highlighted indexed option on enter', done => {
        select.modelChange.subscribe(value => {
          expect(value).toBe(options[0][select.valueField]);

          done();
        });

        select.highlightNextOption();
        select.onEnter();
      });

      describe('allowAdd', () => {
        it('should be able add option', done => {
          select.modelChange.subscribe(value => {
            expect(select.selectedOptions.length).toBe(1);
            expect(value[select.labelField]).toBe('new Value');

            done();
          });

          select.isObjectValue = true;
          select.inputValue = 'new Value';
          select.createOption();
        });
      });
    });

    describe('isMultiple', () => {
      beforeEach(() => {
        select.isMultiple = true;
      });

      it('isMultiple + !isObjectValue => [selectedOption[valueField]]', done => {
        select.modelChange.subscribe(val => {
          expect(val.length).toBe(1);
          expect(val[0]).toBe(select.options[0][select.valueField]);

          done();
        });

        select.selectOption(select.options[0]);
      });

      it('isMultiple + isObjectValue => [selectedOption]', done => {
        select.modelChange.subscribe(val => {
          expect(val.length).toBe(1);
          expect(val[0]).toBe(select.options[0]);

          done();
        });

        select.isObjectValue = true;
        select.selectOption(select.options[0]);
      });

      it('should not have more than maxItems', done => {
        select.isMultiple = true;
        select.maxItems = 2;

        select.selectOption(select.options[0]);
        select.selectOption(select.options[1]);
        select.selectOption(select.options[2]);

        setTimeout(() => {
          expect(select.selectedOptions.length).toBe(select.maxItems);
          done();
        }, 100);
      });

      it('should not close', done => {
        select.modelChange.subscribe(val => {
          expect(select.isOpen).toBeTruthy();
          done();
        });

        select.focus();
        select.selectOption(select.options[0]);
      });

      it('should not be in availableOptions when isMultiple and selected', done => {
        select.modelChange.subscribe(val => {
          const selectedOption = select.availableOptions.find(elem => {
            return elem.data[select.valueField] === select.options[0][select.valueField];
          });

          expect(selectedOption).toBeUndefined();

          done();
        });

        select.focus();
        select.selectOption(select.options[0]);
      });

      it('should add the highlighted indexed option on enter', done => {
        select.modelChange.subscribe(value => {
          expect(value[0]).toBe(options[0][select.valueField]);

          done();
        });

        select.highlightNextOption();
        select.onEnter();
      });

      describe('allowAdd', () => {
        beforeEach(() => {
          select.allowAdd = true;
        });

        it('should not allow to set !isObjectValue', () => {
          expect(() => select.ngOnInit()).toThrow(new Error('This is a dangerous config, dont use'));
        });

        describe('isObjectValue', () => {
          beforeEach(() => {
            select.isObjectValue = true;
          });

          it('should be able add option', done => {
            select.modelChange.subscribe(value => {
              const added = value[0];
              expect(select.selectedOptions.length).toBe(1);
              expect(added[select.labelField]).toBe('new Value');

              done();
            });

            select.inputValue = 'new Value';
            select.createOption();
          });

          it('should update added selected item\'s valueFields on async option', done => {
            select.modelChange.subscribe(val => {
              const option = val[0];
              expect(option[select.labelField]).toBe('Valami');
              expect(option[select.valueField]).toBe('asnyc-id');

              done();
            });

            select.model = [{id: null, name: 'valami'}];
            select.options = [{ id: 'asnyc-id', name: 'Valami' }];
          });

          it('should not select if its already selected', done => {
            select.model = [{ id: 'fake-id-1', name: 'Fake-name-1'}];

            select.inputValue = 'fake-name-1';
            select.createOption();

            setTimeout(() => {
              expect(select.selectedOptions.length).toBe(1);
              expect(select.selectedOptions[0][select.labelField]).toBe('Fake-name-1');
              done();
            }, 100);
          });

          it('should not let allow add elem which is already in selectedOptions', done => {
            select.isMultiple = true;
            select.allowAdd = true;
            select.isObjectValue = true;

            select.model = [{ id: 'fake-id-1', name: 'Fake-name-1'}];

            select.inputValue = 'fake-name-1';
            select.onInputChange(select.inputValue);

            setTimeout(() => {
              expect(select.isAddBtnVisible).toBeFalsy();
              expect(select.isNoFilterResults).toBeTruthy();
              done();
            }, 100);
          });
        });
      });
    });
  });

  describe('removing', () => {
    beforeEach(() => {
      select.options = options;
    });

    it('should be open', done => {
      done();
    });

    it('backspace + !isMultiple: should null the model', done => {
      select.modelChange.subscribe(val => {
        expect(val).toBeNull();

        done();
      });

      select.model = 'fake-id-1';
      select.ngOnInit();

      select.onBackspace();
    });

    it('backspace + isMultiple: should null the model if length === 1', done => {
      select.modelChange.subscribe(val => {
        expect(val.length).toBe(1);

        done();
      });

      select.isMultiple = true;
      select.model = ['fake-id-1', 'fake-id-2'];
      select.ngOnInit();

      select.onBackspace();
    });

    it('backspace + isMultiple: should delete the last item', done => {
      select.isMultiple = true;
      select.model = ['fake-id-1', 'fake-id-2'];
      select.ngOnInit();

      select.onBackspace();
      select.onBackspace();

      setTimeout(() => {
        expect(select.model).toBeNull();
        done();
      }, 100);
    });
  });

  describe('messages', () => {
    it('should show no option available, when options are null', done => {
      select.options = null;

      select.ngOnInit();

      expect(select.isOptionAvailable).toBeFalsy();

      select.options = options;
      setTimeout(() => {
        expect(select.isOptionAvailable).toBeTruthy();

        done();
      }, 100);
    });
  });

  describe('mobile', () => {
    beforeEach(() => {
      select.options = options;
    });

    it('should added options be in the availableOptions', done => {
      select.modelChange.subscribe(val => {
        const added = select.availableOptionsMobile[0];
        expect(added.isSelected).toBeTruthy();
        expect(added.data[select.labelField]).toBe('new-value');

        done();
      });


      select.isMultiple = true;
      select.isObjectValue = true;
      select.allowAdd = true;
      select.ngOnInit();
      select.inputValue = 'new-value';

      select.createOption();
    });
  })
});
