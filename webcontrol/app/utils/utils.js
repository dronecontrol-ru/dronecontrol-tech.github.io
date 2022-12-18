export function uuid() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

/**
 * 
 * @param {string} tag HTML element tag
 * @param {object} options any element options, include classList (string or array), dataset (object), textContent (string)
 * @param {object} parent DOM element
 * @returns DOM element
 */
export function createElement(tag, options, parent) {
    const element = document.createElement(tag);
    options = options || {};
    if (options.dataset) {
        for (let o in options.dataset) {
            element.dataset[o] = options.dataset[o];
        }
        delete(options.dataset);
    }
    if (options.classList) {
        const cl = Array.isArray(options.classList) ? options.classList : [options.classList];
        element.classList.add.apply(element.classList, cl);
        delete(options.classList);
    }
    Object.assign(element, options);
    if (parent) {
        parent.appendChild(element);
    }
    return element;
}

export function scanDomTree(element) {
    element = element || document.body;
    const elements = element.querySelectorAll('[data-tag]');
    const tags = {};
    for (let e = 0; e < elements.length; e++) {
        tags[elements[e].dataset.tag] = elements[e];
    }
    return tags;
}