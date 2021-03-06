export * from './config/bootstrap'
export * from './config/config'

// export * from './components'

export * from './platform/platform'
export * from './platform/storage'

export * from './util/click-block'
export {EventAggregator as Events} from 'aurelia-event-aggregator';
export * from './util/keyboard'
export * from './util/form'

export * from './animations/animation'
export * from './transitions/transition'

export * from './translation/translate'
export * from './translation/translate_pipe'

// these modules don't export anything
import './config/modes'
import './platform/registry'
import './animations/builtins'
import './transitions/transition-ios'
import './transitions/transition-md'
import './transitions/transition-wp'

import {bootstrap} from './config/bootstrap'
import {Config} from './config/config'

export function configure(pluginConfig, callback) {
  let config = new Config();

  if (callback) {
    callback(config);
  }

  let providers = bootstrap({ config: config });

  providers.forEach(function(provider) {
    pluginConfig.container.registerInstance(provider.constructor, provider);
  });
}
