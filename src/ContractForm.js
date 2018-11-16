import React, { Component } from 'react';

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

            for (var j = 0; j < this.inputs.length; j++) {
                initialState.inputs[this.inputs[j].name] = { value: '', error: ''};
            }

            break;
        }
    }
    initialState.error = '';
    this.state = initialState;
  }

  render() {
    return (
      <form className='pure-form pure-form-stacked'>
        <strong>{!this.props.hideMethod ? this.props.method + ': ' : null}</strong>
        {this.inputs.map((input, index) => {            
          var inputType = this.translateType(input.type)
          var inputLabel = this.props.labels ? this.props.labels[index] : input.name
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
    this.setState((prevState) => {
      // check if no error is left
      let error = null;
      for (let input in prevState.inputs) {
        if (prevState.inputs[input].error !== '') {
          error = "There are some errors in the formulary. Please fix them before retrying";
          break;
        }
      }
      if (error) {
        return ({error: error});
      }
      // no error
      if (prevState.error !== '') {
        return({error: ''});
      }
      // call callback function
      let state = this.props.cb ? this.props.cb(prevState.inputs) : prevState.inputs;

      // If an input is of type bytes32 then convert the entered text to hex, if it isn't already valid hex, using web3.
      const values = this.inputs.map((input, i) => {
        if (input.type === 'bytes32' && !this.props.drizzle.web3.utils.isHex(state[input.name].value)) { 
          return this.props.drizzle.web3.utils.toHex(state[input.name].value);
        } else {
          return state[input.name].value;
        }
      });

      if (this.props.sendArgs) {
        return this.props.drizzle.contracts[this.props.contract].methods[this.props.method].cacheSend(...values, this.props.sendArgs);
      }

      this.props.drizzle.contracts[this.props.contract].methods[this.props.method].cacheSend(...values);

      return prevState;
    });

  }

  handleInputChange(event) {
    event.persist();
    this.setState((prevState) => {
      return(this.inputs.reduce((accumulator, input) => {
        let error = '';
        if (input.name === event.target.name) {
          if (input.type === 'address') {
            const missing = 42 - event.target.value.length;
            error = missing ? 'number of chars missing: ' + missing:'';
            if (event.target.value.length === 42 && !this.props.drizzle.web3.utils.checkAddressChecksum(event.target.value)) {
              error = "Please enter an address with valid checksum";
            }
          }
          return Object.assign(accumulator, { inputs: { ...prevState.inputs, [event.target.name]: { value: event.target.value, error: error }}});
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
