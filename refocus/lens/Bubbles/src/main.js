'use strict';
require('./lens.css');
const d3 = require('./lib/d3.v4.min');
require('script!./lib/jquery.min.js');
require('script!./lib/tether.min.js'); // for bootstrap tooltips
require('./lib/bootstrap.min.js'); // for bootstrap
require('./lib/bootstrap.min.css'); // bootstrap

const LENS_ELEMENT = document.getElementById('lens');
const LENS = document.getElementById('lens');

// templates
const handlebars = require('handlebars-template-loader/runtime');
const pageHeaderTemplate = require('./templates/pageHeader.handlebars');

const template = {
  sampleModal: require('./templates/modal-sample.handlebars')
};

let data;
let sampleModal;

/**
 * It can be useful to separate out any data manipulation you need to do
 * before rendering--you want to keep the draw function as tight as possible!
 */
function preprocess(hierarchy) {
  console.log(new Date(), 'preprocessing hierarchy');
  data = hierarchy;
} // preprocess

/**
 * Perform your DOM manipulation here.
 */
function draw(hierarchy) {
  console.log(new Date(), 'drawing');

  // modals
  LENS.insertAdjacentHTML('beforeend', '<div id="modal-bubble" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="gridModalLabel" aria-hidden="true">');
  sampleModal = document.getElementById('modal-bubble');

  // bubbles
  drawBubbles(hierarchy);
  setBubbleListeners(hierarchy);
} // draw

/**
 * Inspired (almost copy and paste) by John Alexis Guerra Gómez’s Block
 * @see https://bl.ocks.org/john-guerra/0d81ccfd24578d5d563c55e785b3b40a
 */
function drawBubbles(hierarchy) {
  var diameter = 960,
      format = d3.format(",d"),
      color = d3.scaleOrdinal(d3.schemeCategory20c);

  var bubble = d3.pack()
      .size([diameter, diameter])
      .padding(1.5);

  var svg = d3.select("body").append("svg")
      .attr("width", diameter)
      .attr("height", diameter)
      .attr("class", "bubble");

  const data = hierarchy;
  var root = d3.hierarchy(classes(data))
      .sum(function(d) { return d.value; });

  bubble(root);
  var node = svg.selectAll(".node")
      .data(root.children)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  node.append("title")
      .text(function(d) { return d.data.className + ": " + format(d.value); });

  node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) {
        return color(d.data.className);
      });

  node.append("text")
      .attr("dy", ".3em")
      .attr("id", function(d) { return d.data.className; })
      .style("text-anchor", "middle")
      .text(function(d) { return d.data.className.substring(0, d.r / 3); });

  // Returns a flattened hierarchy containing all leaf nodes under the root.
  function classes(root) {
    var classes = [];

    function recurse(name, node) {
      if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
      else {
        classes.push({
          packageName: name,
          className: node.name,
          value: (node.samples.length > 0) ? node.samples[0].value : 0
        });
      }
    }

    recurse(null, root);
    return {children: classes};
  }

  d3.select(self.frameElement).style("height", diameter + "px");
} // drawBubbles

const eventTarget = {
  document: document,
  lens: LENS_ELEMENT,
  window: window,
};

/**
 * All the event handlers configured here will be registered on
 * refocus.lens.load.
 */
const eventHandler = {
  document: {
  },
  lens: {
    /**
     * Handle the refocus.lens.hierarchyLoad event. The hierarchy JSON is stored
     * in evt.detail. Preprocess the hierarchy if needed, then call draw.
     */
    'refocus.lens.hierarchyLoad': (evt) => {
      console.log(new Date(), '#lens => refocus.lens.hierarchyLoad');
      preprocess(evt.detail);
      draw(evt.detail);
    }, // refocus.lens.hierarchyLoad

    /**
     * Handle the refocus.lens.realtime.change event. The array of changes is
     * stored in evt.detail. Iterate over the array to perform any preprocessing
     * if needed, then call draw only once after all the data manipulation is
     * done.
     */
    'refocus.lens.realtime.change': (evt) => {
      console.log(new Date(), 'refocus.lens.realtime.change',
        'contains ' + evt.detail.length + ' changes');
      if (!Array.isArray(evt.detail) || evt.detail.length == 0) {
        return;
      }

      evt.detail.forEach((chg) => {
        if (chg['sample.add']) {
          realtimeChangeHandler.onSampleAdd(chg['sample.add'])
        } else if (chg['sample.remove']) {
          realtimeChangeHandler.onSampleRemove(chg['sample.remove'])
        } else if (chg['sample.update']) {
          realtimeChangeHandler.onSampleUpdate(chg['sample.update']);
        } else if (chg['subject.add']) {
          realtimeChangeHandler.onSubjectAdd(chg['subject.add'])
        } else if (chg['subject.remove']) {
          realtimeChangeHandler.onSubjectRemove(chg['subject.remove'])
        } else if (chg['subject.update']) {
          realtimeChangeHandler.onSubjectUpdate(chg['subject.update'])
        }
      }); // evt.detail.forEach

      // Now that we've processed all these changes, draw!
      draw();
    }, // refocus.lens.realtime.change
  },
  window: {
    /**
     * Handle when the browser/tab loses focus, e.g. user switches away from this
     * tab or browser is minimized or browser goes into background.
     */
    blur: () => {
      console.log(new Date(), 'window => blur');
      // TODO implement me!
    }, // blur

    /**
     * Handle when the browser/tab regains focus, e.g. user switches back to this
     * tab or browser is restored from minimized state or browser comes back into
     * foreground.
     */
    focus: () => {
      console.log(new Date(), 'window => focus');
      // TODO implement me!
    }, // focus

    /**
     * Handle when the fragment identifier of the URL has changed (the part of the
     * URL that follows the # symbol, including the # symbol).
     */
    hashchange: (evt) => {
      console.log(new Date(), 'window => hashchange',
        'oldURL=' + evt.oldURL, 'newURL=' + evt.newURL);
      // TODO implement me!
      // For example, if the fragment identifier is a subject or sample, you
      // may want to move focus to the DOM element representing that subject or
      // sample, or open the corresponding modal.
    }, // hashchange

    /**
     * Handle when the view has been resized.
     */
    resize: () => {
      console.log(new Date(), 'window => resize');
      // TODO implement me!
      // For example, you may want to show/hide/move/resize some DOM elements
      // based on the new viewport height and width.
    }, // resize
  },
}; // eventHandler

function bindContentToModal(modal, modalTemplate, context, content) {
  context.data = content;
  const str = modalTemplate(context);
  modal.innerHTML = '';
  modal.insertAdjacentHTML('beforeend', str);
} // bindContentToModal

// bubble listeners
function setBubbleListeners(hierarchy) {
  const bubblesHTMLCollection = document.getElementsByTagName('text');
  let bubbles = [...bubblesHTMLCollection];
  bubbles.forEach((bubble) => {
    bubble.addEventListener('click', (evt) => {
      const sample = hierarchy.children.filter(o => o.name === evt.target.id)[0];

      const conf = {
        close: {
          label: "Close"
        },
        heading: {
          description: "Aspect Description",
          lastUpdated: "Last Updated",
          name: "Name",
          relatedLinks: "Related Links",
          value: "Activity Value"
        }
      };
      sample.value = (sample.samples.length > 0) ? sample.samples[0].value : 0
      bindContentToModal(sampleModal, template.sampleModal,
        conf, sample);
      $('#modal-bubble').modal(); // open the modal
    });
  });
} // setBubbleListeners


const realtimeChangeHandler = {
  onSampleAdd(sample) {
    console.log(new Date(), 'onSampleAdd', sample);
    // TODO implement me!
    // For example, you may need to preprocess and add this new sample to some
    // data structure.
  },
  onSampleRemove(sample) {
    console.log(new Date(), 'onSampleRemove', sample);
    // TODO implement me!
    // For example, you may need to preprocess and remove this sample from some
    // data structure.
  },
  onSampleUpdate(change) {
    console.log(new Date(), 'onSampleUpdate', change);
    // TODO implement me!
    // For example, you may need to preprocess and update this sample in some
    // data structure.
  },
  onSubjectAdd(subject) {
    console.log(new Date(), 'onSubjectAdd', subject);
    // TODO implement me!
    // For example, you may need to preprocess and add this new subject to some
    // data structure.
  },
  onSubjectRemove(subject) {
    console.log(new Date(), 'onSubjectRemove', subject);
    // TODO implement me!
    // For example, you may need to preprocess and remove this subject from
    // some data structure.
  },
  onSubjectUpdate(change) {
    console.log(new Date(), 'onSubjectUpdate', change);
    // TODO implement me!
    // For example, you may need to preprocess and update this subject in some
    // data structure.
  },
}; // realtimeChangeHandler

/*
 * Handle the load event. Register listeners for interesting window and lens
 * events here. This would also be a good place to render any DOM elements
 * which are not dependent on the hierarchy data (e.g. page header, page
 * footer, legend, etc.).
 */
LENS_ELEMENT.addEventListener('refocus.lens.load', () => {
  console.log(new Date(), '#lens => refocus.lens.load');
  LENS.innerHTML = pageHeaderTemplate();
  // Register all the event listeners configured in eventHandler.
  Object.keys(eventHandler).forEach((target) => {
    Object.keys(eventHandler[target]).forEach((eventType) => {
      eventTarget[target].addEventListener(eventType, eventHandler[target][eventType]);
    });
  });

  // TODO implement me!
  // For example, you may want to render any DOM elements which are not
  // dependent on hierarchy data.
}); // "load" event listener
