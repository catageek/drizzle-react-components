const InputValidator = function (type, value, props) {
  let error = '';
  if (type === 'address') {
    const missing = 42 - value.length;
    error = missing ? 'number of chars missing: ' + missing:'';
    if (value.length === 42 && !props.drizzle.web3.utils.checkAddressChecksum(value)) {
      error = "Please enter an address with valid checksum";
    }
  }
  return {value : value, error: error};
}

export default InputValidator;
