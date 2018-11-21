import React, { Component } from 'react';
import InputValidator from './InputValidator';

/*
 * Create component.
 */

class ContractForm extends Component {
  constructor(props) {
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    // Get the contract ABI
    const abi = this.props.drizzle.contracts[this.props.contract].abi;

    this.inputs = [];
    var initialState = {inputs: {}};

    // Iterate over abi for correct function.
    for (var i = 0; i < abi.length; i++) {
        if (abi[i].name === this.props.method) {
            this.inputs = abi[i].inputs;
           break;
        }
    }

    let inputs = props.inputs ? props.inputs : this.inputs;
    for (var j = 0; j < inputs.length; j++) {
        initialState.inputs[inputs[j].name] = { value: '', error: ''};
    }

    initialState.error = '';
    this.state = initialState;
  }

  render() {
    let inputs = this.props.inputs ? this.props.inputs : this.inputs;
    return (
      <form className='pure-form pure-form-stacked'>
        <strong>{!this.props.hideMethod ? this.props.method + ': ' : null}</strong>
        {inputs.map((input, index) => {            
          var inputType = this.translateType(input.type);
          var inputLabel = this.props.labels ? this.props.labels[index] : input.name;
          return (
            <React.Fragment key={input.name}>
              <div><input type={inputType} name={input.name} value={this.state.inputs[input.name].value} placeholder={inputLabel} onChange={this.handleInputChange} /></div>
              <Error text={this.state.inputs[input.name].error} />
            </React.Fragment>
          )
        })}
        <Error text={this.state.error} />
        <button key='submit' className='pure-button' type='button' onClick={this.handleSubmit}>Submit</button>
      </form>
    );
  }

  handleSubmit() {
    this.setState((prevState, props) => {

      // call callback function
      let {inputs} = this.props.cb ? this.props.cb(prevState.inputs) : prevState.inputs;

      let state = this.inputs.reduce((accumulator, input) => {
        // Call Input Validator
        let {value, error} = InputValidator(input.type, inputs[input.name].value, props);
        return Object.assign(accumulator, { inputs: { ...inputs, [input.name]: { value: value, error: error }}});
      }, prevState);

      let error = null;
      // check if no error is left
      for (let input in state.inputs) {
        if (state.inputs[input].error !== '') {
          error = "There are some errors in the formulary. Please fix them before retrying";
          break;
        }
      }

      if (error) {
        return ({...state, error: error});
      }
      // no error
      if (state.error !== '') {
        state.error = '';
      }

      let values = Object.keys(state.inputs).map((key) => {
        return state.inputs[key].value;
      });

      if (this.props.sendArgs) {
        return this.props.drizzle.contracts[this.props.contract].methods[this.props.method].cacheSend(...values, this.props.sendArgs);
      }

      this.props.drizzle.contracts[this.props.contract].methods[this.props.method].cacheSend(...values);

      return state;
    });

  }

  handleInputChange(event) {
    event.persist();
    this.setState((prevState, props) => {
      return(this.inputs.reduce((accumulator, input) => {
        if (input.name === event.target.name) {
          // Call Input Validator
          let {value, error} = InputValidator(input.type, event.target.value, props);
          return Object.assign(accumulator, { inputs: { ...prevState.inputs, [event.target.name]: { value: value, error: error }}});
        }
        return accumulator;
      }, prevState));
    }
    );
  }

  translateType(type) {
    switch(true) {
        case /^uint/.test(type):
            return 'number';
        case /^string/.test(type) || /^bytes/.test(type):
            return 'text';
        case /^bool/.test(type):
            return 'checkbox';
        default:
            return 'text';
    }
  }
}

function Error(props) {
  if (props.text !== '') {
    return (<div className='input-error' style={{display: 'block', 'minHeight': 23}}>{props.text}</div>);
  }
  return (<div style={{display: 'block', 'minHeight': 23}}></div>);
}

export default ContractForm;
