import {autoinject} from 'aurelia-framework';
import {Config} from '../config/config';
import {Form} from './form';
import {hasFocusedTextInput, raf, rafFrames} from './dom';

/**
 * @name Keyboard
 * @description
 * The `Keyboard` class allows you to work with the keyboard events provided by the Ionic keyboard plugin.
 *
 * @usage
 * ```ts
 * export class MyClass{
 *  constructor(keyboard: Keyboard){
 *    this.keyboard = keyboard;
 *  }
 * }
 *
 * ```
 */

@autoinject
export class Keyboard {

  constructor(config: Config, private _form: Form) {
    this.focusOutline(config.get('focusOutline'), document);
  }


/**
 * Chech to see if the keyboard is open or not.
 *
 * ```ts
 * export class MyClass{
 *  constructor(keyboard: Keyboard){
 *    this.keyboard = keyboard;
 *  }
 *  keyboardCheck(){
 *    setTimeout(()  => console.log('is the keyboard open ', this.keyboard.isOpen()));
 *  }
 * }
 *
 * ```
 *
 * @return {boolean} returns a true or flase value if the keyboard is open or not
 */
  isOpen() {
    return hasFocusedTextInput();
  }

/**
 * When the keyboard is closed, call any methods you want
 *
 * ```ts
 * export class MyClass{
 *  constructor(keyboard: Keyboard){
 *    this.keyboard = keyboard;
 *    this.keyboard.onClose(this.closeCallback);
 *  }
 *  closeCallback(){
 *     // call what ever functionality you want on keyboard close
 *     console.log('Closing time');
 *  }
 * }
 *
 * ```
 * @param {function} callback method you want to call when the keyboard has been closed
 * @return {function} returns a callback that gets fired when the keyboard is closed
 */
  onClose(callback, pollingInternval=KEYBOARD_CLOSE_POLLING) {
    console.debug('keyboard onClose');
    const self = this;
    let checks = 0;

    let promise = null;

    if (!callback) {
      // a callback wasn't provided, so let's return a promise instead
      promise = new Promise(resolve => { callback = resolve; });
    }

    function checkKeyboard() {
      console.debug('keyboard isOpen', self.isOpen(), checks);
      if (!self.isOpen() || checks > 100) {
        rafFrames(30, () => {
          console.debug('keyboard closed');
          callback();
        });

      } else {
        setTimeout(checkKeyboard, pollingInternval);
      }
      checks++;
    }

    setTimeout(checkKeyboard, pollingInternval);

    return promise;
  }

/**
 * Progamatically close they keyboard
 *
 */
  close() {
    console.debug('keyboard close()');
    raf(() => {
      if (hasFocusedTextInput()) {
        // only focus out when a text input has focus
        this._form.focusOut();
      }
    });
  }

/**
 * @private
 */
  focusOutline(setting, document) {
    /* Focus Outline
     * --------------------------------------------------
     * By default, when a keydown event happens from a tab key, then
     * the 'focus-outline' css class is added to the body element
     * so focusable elements have an outline. On a mousedown or
     * touchstart event, then the 'focus-outline' css class is removed.
     *
     * Config default overrides:
     * focusOutline: true     - Always add the focus-outline
     * focusOutline: false    - Do not add the focus-outline
     */

    let self = this;
    let isKeyInputEnabled = false;

    function cssClass() {
      raf(() => {
        document.body.classList[isKeyInputEnabled ? 'add' : 'remove']('focus-outline');
      });
    }

    if (setting === true) {
      isKeyInputEnabled = true;
      return cssClass();

    } else if (setting === false) {
      return;
    }

    // default is to add the focus-outline when the tab key is used
    function keyDown(ev) {
      if (!isKeyInputEnabled && ev.keyCode == 9) {
        isKeyInputEnabled = true;
        enableKeyInput();
      }
    }

    function pointerDown() {
      isKeyInputEnabled = false;
      enableKeyInput();
    }

    function enableKeyInput() {
      cssClass();

      document.removeEventListener('mousedown', pointerDown);
      document.removeEventListener('touchstart', pointerDown);

      if (isKeyInputEnabled) {
        document.addEventListener('mousedown', pointerDown);
        document.addEventListener('touchstart', pointerDown);
      }
    }

    document.addEventListener('keydown', keyDown);
  }

}

const KEYBOARD_CLOSE_POLLING = 150;
