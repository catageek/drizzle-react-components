import React, { Component } from 'react';
import EqualArray from 'equal-array';

/*
 * Create component.
 */

class ContractData extends Component {
	constructor(props) {
		super(props);
		this.state = { dataKey: null };
		this.eq = new EqualArray();
	}

	componentDidMount() {
		const methodArgs = this.props.methodArgs ? this.props.methodArgs : [];
		const dataKey = this.props.drizzle.contracts[this.props.contract].methods[this.props.method].cacheCall(...methodArgs);
		this.setState({ dataKey: dataKey });
	}

	componentDidUpdate(prevProps) {
		const methodArgs = this.props.methodArgs ? this.props.methodArgs : [];
		const prevMethodArgs = prevProps.methodArgs ? prevProps.methodArgs : [];
		if (this.eq(methodArgs) !== this.eq(prevMethodArgs)) {
			const dataKey = this.props.drizzle.contracts[this.props.contract].methods[this.props.method].cacheCall(...methodArgs);
			this.setState({ dataKey: dataKey });
		}
	}

	render() {
		const { drizzle, drizzleState } = this.props;

		// Contract is not yet intialized.
		if(!drizzleState.contracts[this.props.contract].initialized) {
			return (
				<span>Initializing...</span>
			);
		}
	
		// If the cache key we received earlier isn't in the store yet; the initial value is still being fetched.
		if(!(this.state.dataKey in drizzleState.contracts[this.props.contract][this.props.method])) {
			return null;
		}

		// Show a loading spinner for future updates.
		var pendingSpinner = drizzleState.contracts[this.props.contract].synced ? '' : ' 🔄';
		
		// Optionally hide loading spinner (EX: ERC20 token symbol).
		if (this.props.hideIndicator) {
			pendingSpinner = '';
		}

		var displayData = drizzleState.contracts[this.props.contract][this.props.method][this.state.dataKey].value;
		
		if (displayData instanceof Object) {
			displayData = Object.values(displayData);
		}

		if (this.props.displayFunc) {
			return this.props.displayFunc(displayData);
		}

		// Need to convert on an per-item basis for Objects/arrays.

		// Optionally convert to UTF8
		if (this.props.toUtf8) {
			displayData = drizzle.web3.utils.hexToUtf8(displayData);
		}
		
		// Optionally convert to Ascii
		if (this.props.toAscii) {
			displayData = drizzle.web3.utils.hexToAscii(displayData);
		}

		if (displayData instanceof Array) {
			const displayListItems = displayData.map((datum, i) => (
				<li key={i}>{datum}{pendingSpinner}</li>
			));
			return (
				<ul>{displayListItems}</ul>
			);
		}
      
		return (
			<span>{displayData}{pendingSpinner}</span>
		);
	}
}

export default ContractData;
