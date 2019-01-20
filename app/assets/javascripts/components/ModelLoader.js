import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import * as tf from '@tensorflow/tfjs';
import {apiFetchJson} from '../helpers/apiFetchJson';


/*
Load a TensorFlow model.

<ModelLoader>
  {model} => (
    <div>
      <div>hello {isReady ? model.predict('hello')}</div>
      <div>goodbye {isReady ? model.predict('hello')}</div>
    <div>
  )}
</ModelLoader>

From:
https://js.tensorflow.org/tutorials/import-keras.html
https://github.com/tensorflow/tfjs-examples/tree/master/sentiment
https://github.com/tensorflow/tfjs-examples/blob/6fa70fa93b394c092ce5f492c1536e7808e4686d/sentiment/index.js#L60
*/
export default class ModelLoader extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      model: null
    };

    this.makePrediction = this.makePrediction.bind(this);
    this.loadModel = this.loadModel.bind(this);
    this.onModelLoaded = this.onModelLoaded.bind(this);
    this.onDictionaryLoaded = this.onDictionaryLoaded.bind(this);
  }

  componentDidMount() {
    this.loadModel();
  }

  isReady() {
    const {model, dictionary} = this.state;
    return (model && dictionary);
  }

  makePrediction(text) {
    const {model, dictionary} = this.state;
    if (!this.isReady()) return;
    return predict(model, dictionary, text);
  }

  loadModel() {
    const modelUrl = '/experimental/model.json';
    tf.loadModel(modelUrl)
      .then(this.onModelLoaded.bind(this))
      .catch(err => console.error(err));
  }

  onModelLoaded(model) {
    // console.log('modelLoaded', model);
    apiFetchJson('/experimental/token_dictionary.json')
      .then(this.onDictionaryLoaded.bind(this, model));
  }

  onDictionaryLoaded(model, dictionary) {
    this.setState({model, dictionary});
  }

  render() {
    const {children} = this.props;  
    return children(this.isReady() ? this.makePrediction : null);
  }
}

ModelLoader.propTypes = {
  children: PropTypes.func.isRequired
};


/* eslint-disable no-console */
function predict(model, dictionary, text) {
  try {
    // Convert to lower case and remove all punctuations.
    const inputText = text.trim().toLowerCase().replace(/(\.|\,|\!)/g, '').split(' ');
    // console.log('inputText', inputText);

    // Convert the words to a sequence of word indices.
    const sequence = _.compact(inputText.map(word => dictionary[word]));
    // console.log('sequence', sequence);
    
    // Perform truncation and padding.
    const paddedSequence = _.range(0, 13000).map(index => {
      return (sequence.indexOf(index) !== -1) ? 1 : 0;
    });
    // console.log('ones', _.flatMap(paddedSequence, (val, i) => val === 1 ? [i] : []));

    // do prediction
    const input = tf.tensor2d(paddedSequence, [1, 13000]);
    // console.log('input', input);
    const prediction = model.predict(input);
    // console.log('prediction', prediction);
    const score = prediction.dataSync()[0];
    // console.log('score', score);
    prediction.dispose();
    return score;
  } catch(err) {
    console.error('caught');
    console.error(err);
    return null;
  }
}


export function renderPrediction(predict, text) {
  const prediction = (predict)
    ? predict(text)
    : null;
  return (
    <span style={{
      color: 'white',
      opacity: 0.5,
      backgroundColor: !predict ? 'yellow' : prediction && prediction >= 0.5
        ? 'red'
        : 'green',
      padding: 5
    }}>
      {!predict ? '...' : `restricted: ${Math.round(100 * prediction, 2)}`}
    </span>
  );
}