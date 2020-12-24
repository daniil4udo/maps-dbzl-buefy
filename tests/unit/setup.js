import fs from 'fs';
import path from 'path';

import Vue from 'vue';

// ===
// Utility functions
// ===

// https://vue-test-utils.vuejs.org/
const vueTestUtils = require('@vue/test-utils');
// https://lodash.com/
const _ = require('lodash');

_.mixin({
    pascalCase: _.flow(_.camelCase, _.upperFirst),
});

// Configure Vue
// ===

// Don't warn about not using the production build of Vue, as
// we care more about the quality of errors than performance
// for tests.
Vue.config.productionTip = false;

// ===
// Register global components
// ===

const globalComponentFiles = fs
    .readdirSync(path.join(__dirname, '../../src/components'))
    .filter(fileName => /^_base-.+\.vue$/.test(fileName));

for (const fileName of globalComponentFiles) {
    const componentName = _.pascalCase(fileName.match(/^_(base-.+)\.vue$/)[1]);
    const componentConfig = require(`../../src/components/${fileName}`);
    Vue.component(componentName, componentConfig.default || componentConfig);
}

// ===
// Mock window properties not handled by jsdom
// ===

Object.defineProperty(window, 'localStorage', {
    value: (function () {
        let store = {};
        return {
            getItem(key) {
                return store[key] || null;
            },
            setItem(key, value) {
                store[key] = value.toString();
            },
            clear() {
                store = {};
            },
        };
    }()),
});

// ===
// Console handlers
// ===
const { warn, error } = console;
console.error = function (message) {
    error.apply(console, arguments);
    // Make console.error throw, so that Jest tests fail
    throw message instanceof Error ? message : new Error(message);
    // NOTE: You can whitelist some `console.error` messages here
    // by returning if the `message` value is acceptable.
};

console.warn = function (message) {
    warn.apply(console, arguments);
    // Make console.warn throw, so that Jest tests fail
    throw message instanceof Error ? message : new Error(message);
    // NOTE: You can whitelist some `console.warn` messages here
    // by returning if the `message` value is acceptable.
};

// ===
// Global helpers
// ===

// https://vue-test-utils.vuejs.org/api/#mount
global.mount = vueTestUtils.mount;

// https://vue-test-utils.vuejs.org/api/#shallowmount
global.shallowMount = vueTestUtils.shallowMount;

// A special version of `shallowMount` for view components
global.shallowMountView = (Component, options = {}) => global.shallowMount(Component, {
    ...options,
    stubs: {
        Layout: {
            functional: true,
            render(h, { slots }) {
                return <div>{slots().default}</div>;
            },
        },
        ...(options.stubs || {}),
    },
});

// A helper for creating Vue component mocks
global.createComponentMocks = ({ store, router, style, mocks, stubs }) => {
    // Use a local version of Vue, to avoid polluting the global
    // Vue and thereby affecting other tests.
    // https://vue-test-utils.vuejs.org/api/#createlocalvue
    const localVue = vueTestUtils.createLocalVue();
    const returnOptions = { localVue };

    // https://vue-test-utils.vuejs.org/api/options.html#stubs
    returnOptions.stubs = stubs || {};
    // https://vue-test-utils.vuejs.org/api/options.html#mocks
    returnOptions.mocks = mocks || {};

    // If using `router: true`, we'll automatically stub out
    // components from Vue Router.
    if (router) {
        returnOptions.stubs['router-link'] = true;
        returnOptions.stubs['router-view'] = true;
    }

    // If a `style` object is provided, mock some styles.
    if (style) {
        returnOptions.mocks.$style = style;
    }

    return returnOptions;
};
