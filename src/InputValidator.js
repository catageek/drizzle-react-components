const InputValidator = function (type, value, props) {
  let error = '';
  // Check checksum
  if (type === 'address') {
    if (value.length === 42 && !props.drizzle.web3.utils.checkAddressChecksum(value)) {
      error = "Please enter an address with valid checksum";
    }
  }

  // If an input is of type bytes32 then convert the entered text to hex, if it isn't already valid hex, using web3.
  if (type === 'bytes32' && !props.drizzle.web3.utils.isHex(value)) { 
    value = props.drizzle.web3.utils.toHex(value);
  }

  return {value : value, error: error};
}

export default InputValidator;
