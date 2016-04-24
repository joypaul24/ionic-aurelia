import {autoinject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

import {Config} from '../../config/config';
import {ClickBlock} from '../../util/click-block';
import {Platform} from '../../platform/platform';


/**
 * App utility service.  Allows you to look up components that have been
 * registered using the [Id directive](../Id/).
 */
@autoinject
export class IonicApp {
  private _cmps: {[id: string]: any} = {};
  private _disTime: number = 0;
  private _scrollTime: number = 0;
  private _title: string = '';
  private _rootNav: any = null;
  private _appInjector: Injector;

  constructor(
    private _config: Config,
    private _clickBlock: ClickBlock,
    events: EventAggregator
  ) {
    events.subscribe('backButton', () => {
      let activeNav = this.getActiveNav();
      if (activeNav) {
        if (activeNav.length() === 1) {
          platform.exitApp();
        } else {
          activeNav.pop();
        }
      }
    });
  }

  /**
   * Sets the document title.
   * @param {string} val  Value to set the document title to.
   */
  setTitle(val: string) {
    if (val !== this._title) {
      // TODO: probably this is odd and
      // title can be set using `configureRouter` method of root component
      this._title = val;
    }
  }

  /**
   * @private
   * Sets if the app is currently enabled or not, meaning if it's
   * available to accept new user commands. For example, this is set to `false`
   * while views transition, a modal slides up, an action-sheet
   * slides up, etc. After the transition completes it is set back to `true`.
   * @param {boolean} isEnabled
   * @param {boolean} fallback  When `isEnabled` is set to `false`, this argument
   * is used to set the maximum number of milliseconds that app will wait until
   * it will automatically enable the app again. It's basically a fallback incase
   * something goes wrong during a transition and the app wasn't re-enabled correctly.
   */
  setEnabled(isEnabled: boolean, duration: number = 700) {
    this._disTime = (isEnabled ? 0 : Date.now() + duration);

    if (duration > 32 || isEnabled) {
      // only do a click block if the duration is longer than XXms
      this._clickBlock.show(!isEnabled, duration + 64);
    }
  }

  /**
   * @private
   * Boolean if the app is actively enabled or not.
   * @return {boolean}
   */
  isEnabled(): boolean {
    return (this._disTime < Date.now());
  }

  /**
   * @private
   */
  setScrolling() {
    this._scrollTime = Date.now();
  }

  /**
   * Boolean if the app is actively scrolling or not.
   * @return {boolean}
   */
  isScrolling(): boolean {
    return (this._scrollTime + 64 > Date.now());
  }

  /**
   * @private
   */
  getActiveNav(): any {
    var nav = this._rootNav || null;
    var activeChildNav;

    while (nav) {
      activeChildNav = nav.getActiveChildNav();
      if (!activeChildNav) {
        break;
      }
      nav = activeChildNav;
    }

    return nav;
  }

  /**
   * @private
   */
  getRootNav(): any {
    return this._rootNav;
  }

  /**
   * @private
   */
  setRootNav(nav: any) {
    this._rootNav = nav;
  }

  /**
   * @private
   * Register a known component with a key, for easy lookups later.
   * @param {string} id  The id to use to register the component
   * @param {object} component  The component to register
   */
  register(id: string, component: any) {
    this._cmps[id] = component;
  }

  /**
   * @private
   * Unregister a known component with a key.
   * @param {string} id  The id to use to unregister
   */
  unregister(id: string) {
    delete this._cmps[id];
  }

  /**
   * @private
   * Get a registered component with the given type (returns the first)
   * @param {object} cls the type to search for
   * @return {object} the matching component, or undefined if none was found
   */
  getRegisteredComponent(cls: any): any {
    for (let key in this._cmps) {
      const component = this._cmps[key];
      if (component instanceof cls) {
        return component;
      }
    }
  }

  /**
   * Get the component for the given key.
   */
  getComponent(id: string): any {
    // deprecated warning
    if (/menu/i.test(id)) {
      console.warn('Using app.getComponent(menuId) to control menus has been deprecated as of alpha55.\n' +
                   'Instead inject MenuController, for example:\n\n' +
                   'constructor(menu: MenuController) {\n' +
                   '  this.menu = menu;\n' +
                   '}\n' +
                   'toggleMenu() {\n' +
                   '  this.menu.toggle();\n' +
                   '}\n' +
                   'openRightMenu() {\n' +
                   '  this.menu.open("right");\n' +
                   '}'
      );
    }

    return this._cmps[id];
  }

  /**
   * Set the global app injector that contains references to all of the instantiated providers
   * @param injector
   */
  setAppInjector(injector: Injector) {
    this._appInjector = injector;
  }

  /**
   * Get an instance of the global app injector that contains references to all of the instantiated providers
   * @returns {Injector}
   */
  getAppInjector(): Injector {
    return this._appInjector;
  }
}
