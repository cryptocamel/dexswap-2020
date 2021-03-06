import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from "classnames";
import { connect } from 'react-redux';
import { BigNumber as BN } from 'bignumber.js';
import NavigationTabs from "../../components/NavigationTabs";
import ModeSelector from "./ModeSelector";
import CurrencyInputPanel from "../../components/CurrencyInputPanel";
import { selectors, addPendingTx } from '../../ducks/web3connect';
import ContextualInfo from "../../components/ContextualInfo";
import OversizedPanel from "../../components/OversizedPanel";
import ArrowDownBlue from "../../assets/images/arrow-down-blue.svg";
import ArrowDownGrey from "../../assets/images/arrow-down-grey.svg";
import EXCHANGE_ABI from "../../abi/exchange";
import promisify from "../../helpers/web3-promisfy";
import ReactGA from "react-ga";

class RemoveLiquidity extends Component {
  static propTypes = {
    account: PropTypes.string,
    balances: PropTypes.object,
    web3: PropTypes.object,
    exchangeAddresses: PropTypes.shape({
      fromToken: PropTypes.object.isRequired,
    }).isRequired,
  };

  state = {
    tokenAddress: '',
    value: '',
    totalSupply: BN(0),
  };

  reset() {
    this.setState({
      value: '',
    });
  }

  validate() {
    const { tokenAddress, value } = this.state;
    const { account, selectors, exchangeAddresses: { fromToken }, web3 } = this.props;
    const exchangeAddress = fromToken[tokenAddress];

    if (!web3 || !exchangeAddress || !account || !value) {
      return {
        isValid: false,
      };
    }

    const { getBalance } = selectors();

    const { value: liquidityBalance, decimals: liquidityDecimals } = getBalance(account, exchangeAddress);

    if (liquidityBalance.isLessThan(BN(value).multipliedBy(10 ** liquidityDecimals))) {
      return { isValid: false, errorMessage: 'Insufficient balance' };
    }

    return {
      isValid: true,
    };
  }

  onTokenSelect = async tokenAddress => {
    const { exchangeAddresses: { fromToken }, web3 } = this.props;
    const exchangeAddress = fromToken[tokenAddress];
    this.setState({ tokenAddress });

    if (!web3 || !exchangeAddress) {
      return;
    }

    const exchange = new web3.eth.Contract(EXCHANGE_ABI, exchangeAddress);

    const totalSupply = await exchange.methods.totalSupply().call();
    this.setState({
      totalSupply: BN(totalSupply),
    });
  };

  onInputChange = value => {
    this.setState({ value });
  };

  onRemoveLiquidity = async () => {
    const { tokenAddress, value: input, totalSupply } = this.state;
    const {
      exchangeAddresses: { fromToken },
      web3,
      selectors,
      account,
    } = this.props;
    const exchangeAddress = fromToken[tokenAddress];
    const { getBalance } = selectors();
    if (!web3 || !exchangeAddress) {
      return;
    }
    const exchange = new web3.eth.Contract(EXCHANGE_ABI, exchangeAddress);
    const SLIPPAGE = .02;
    const { decimals } = getBalance(account, exchangeAddress);
    const { value: ethReserve } = getBalance(exchangeAddress);
    const { value: tokenReserve } = getBalance(exchangeAddress, tokenAddress);
    const amount = BN(input).multipliedBy(10 ** decimals);

    const ownership = amount.dividedBy(totalSupply);
    const ethWithdrawn = ethReserve.multipliedBy(ownership);
    const tokenWithdrawn = tokenReserve.multipliedBy(ownership);
    const blockNumber = await promisify(web3, 'getBlockNumber');
    const block = await promisify(web3, 'getBlock', blockNumber);
    const deadline =  block.timestamp + 300;

    exchange.methods.removeLiquidity(
      amount.toFixed(0),
      ethWithdrawn.multipliedBy(1 - SLIPPAGE).toFixed(0),
      tokenWithdrawn.multipliedBy(1 - SLIPPAGE).toFixed(0),
      deadline,
    ).send({ from: account }, (err, data) => {
      if (data) {
        this.reset();

        this.props.addPendingTx(data);
        ReactGA.event({
          category: 'Pool',
          action: 'RemoveLiquidity',
        });
      }
    });
  };

  getBalance = () => {
    const {
      exchangeAddresses: { fromToken },
      account,
      web3,
      selectors,
    } = this.props;

    const { tokenAddress } = this.state;

    if (!web3) {
      return '';
    }

    const exchangeAddress = fromToken[tokenAddress];
    if (!exchangeAddress) {
      return '';
    }
    const { value, decimals } = selectors().getBalance(account, exchangeAddress);
    return `Balance: ${value.dividedBy(10 ** decimals).toFixed(7)}`;
  };

  renderSummary(errorMessage) {
    const { selectors, exchangeAddresses: { fromToken } } = this.props;
    const {
      value: input,
      tokenAddress,
    } = this.state;
    const inputIsZero = BN(input).isZero();
    let contextualInfo = '';
    let isError = false;

    if (errorMessage) {
      contextualInfo = errorMessage;
      isError = true;
    } else if (!tokenAddress) {
      contextualInfo = 'Select a token to continue.';
    } else if (inputIsZero) {
      contextualInfo = 'Amount cannot be zero.';
    } else if (!input) {
      const { label } = selectors().getTokenBalance(tokenAddress, fromToken[tokenAddress]);
      contextualInfo = `Enter a ${label} value to continue.`;
    }

    return (
      <ContextualInfo
        key="context-info"
        contextualInfo={contextualInfo}
        isError={isError}
        modalClass="pool__summary-modal"
        renderTransactionDetails={this.renderTransactionDetails}
      />
    );
  }

  renderTransactionDetails = () => {
    const { tokenAddress, value: input, totalSupply } = this.state;
    const {
      exchangeAddresses: { fromToken },
      web3,
      selectors,
      account,
    } = this.props;
    const exchangeAddress = fromToken[tokenAddress];
    const { getBalance } = selectors();

    if (!exchangeAddress) {
      return null;
    }

    ReactGA.event({
      category: 'TransactionDetail',
      action: 'Open',
    });

    const SLIPPAGE = 0.025;
    const { value: liquidityBalance, decimals } = getBalance(account, exchangeAddress);
    const { value: ethReserve } = getBalance(exchangeAddress);
    const { value: tokenReserve, label, decimals: reserveDecimals } = getBalance(exchangeAddress, tokenAddress);

    const ethPer = ethReserve.dividedBy(totalSupply);
    const tokenPer = tokenReserve.dividedBy(totalSupply);

    const ethWithdrawn = ethPer.multipliedBy(input);

    const tokenWithdrawn = tokenPer.multipliedBy(input);
    const minTokenWithdrawn = tokenWithdrawn.multipliedBy(1 - SLIPPAGE).toFixed(7);
    const maxTokenWithdrawn = tokenWithdrawn.multipliedBy(1 + SLIPPAGE).toFixed(7);

    const adjTotalSupply = totalSupply.dividedBy(10 ** decimals).minus(input);

    return (
      <div>
        <div className="pool__summary-modal__item">You are removing between {b(`${+BN(ethWithdrawn).toFixed(7)} ETH`)} and {b(`${+minTokenWithdrawn} - ${+maxTokenWithdrawn} ${label}`)} into the liquidity pool.</div>
        <div className="pool__summary-modal__item">You will remove {b(+input)} liquidity tokens.</div>
        <div className="pool__summary-modal__item">Current total supply of liquidity tokens is {b(+adjTotalSupply.toFixed(7))}</div>
        <div className="pool__summary-modal__item">At current exchange rate, each pool token is worth {b(+ethReserve.dividedBy(totalSupply).toFixed(7))} ETH and {b(+tokenReserve.dividedBy(totalSupply).toFixed(7))} {label}</div>
      </div>
    );
  }

  renderOutput() {
    const {
      exchangeAddresses: { fromToken },
      account,
      web3,
      selectors,
    } = this.props;
    const { getBalance } = selectors();

    const { tokenAddress, totalSupply, value: input } = this.state;


    const exchangeAddress = fromToken[tokenAddress];
    if (!exchangeAddress || !web3) {
      return [
        <CurrencyInputPanel
          key="remove-liquidity-input"
          title="Output"
          description="(estimated)"
          renderInput={() => (
            <div className="remove-liquidity__output"></div>
          )}
          disableTokenSelect
          disableUnlock
        />,
        <OversizedPanel key="remove-liquidity-input-under" hideBottom>
          <div className="pool__summary-panel">
            <div className="pool__exchange-rate-wrapper">
              <span className="pool__exchange-rate">Exchange Rate</span>
              <span> - </span>
            </div>
            <div className="pool__exchange-rate-wrapper">
              <span className="swap__exchange-rate">Current Pool Size</span>
              <span> - </span>
            </div>
            <div className="pool__exchange-rate-wrapper">
              <span className="swap__exchange-rate">Your Pool Share</span>
              <span> - </span>
            </div>
          </div>
        </OversizedPanel>
      ];
    }
    const { value: liquidityBalance } = getBalance(account, exchangeAddress);
    const { value: ethReserve } = getBalance(exchangeAddress);
    const { value: tokenReserve, decimals: tokenDecimals, label } = getBalance(exchangeAddress, tokenAddress);

    const ownership = liquidityBalance.dividedBy(totalSupply);
    const ethPer = ethReserve.dividedBy(totalSupply);
    const tokenPer = tokenReserve.multipliedBy(10 ** (18 - tokenDecimals)).dividedBy(totalSupply);
    const exchangeRate = tokenReserve.multipliedBy(10 ** (18 - tokenDecimals)).div(ethReserve);

    const ownedEth = ethPer.multipliedBy(liquidityBalance).dividedBy(10 ** 18);
    const ownedToken = tokenPer.multipliedBy(liquidityBalance).dividedBy(10 ** tokenDecimals);

    return [
      <CurrencyInputPanel
        title="Output"
        description="(estimated)"
        key="remove-liquidity-input"
        renderInput={() => input
          ? (
            <div className="remove-liquidity__output">
              <div className="remove-liquidity__output-text">
                {`${ethPer.multipliedBy(input).toFixed(3)} ETH`}
              </div>
              <div className="remove-liquidity__output-plus"> + </div>
              <div className="remove-liquidity__output-text">
                {`${tokenPer.multipliedBy(input).toFixed(3)} ${label}`}
              </div>
            </div>
          )
          : <div className="remove-liquidity__output" />
        }
        disableTokenSelect
        disableUnlock
      />,
      <OversizedPanel key="remove-liquidity-input-under" hideBottom>
        <div className="pool__summary-panel">
          <div className="pool__exchange-rate-wrapper">
            <span className="pool__exchange-rate">Exchange Rate</span>
            <span>
              {`1 ETH = ${exchangeRate.toFixed(4)} ${label}`}
            </span>
          </div>
          <div className="pool__exchange-rate-wrapper">
            <span className="swap__exchange-rate">Current Pool Size</span>
            <span>{`${ethReserve.dividedBy(10 ** 18).toFixed(2)} ETH + ${tokenReserve.dividedBy(10 ** tokenDecimals).toFixed(2)} ${label}`}</span>
          </div>
          <div className="pool__exchange-rate-wrapper">
            <span className="swap__exchange-rate">
              Your Pool Share ({ownership.multipliedBy(100).toFixed(2)}%)
            </span>
            <span>{`${ownedEth.toFixed(2)} ETH + ${ownedToken.toFixed(2)} ${label}`}</span>
          </div>
        </div>
      </OversizedPanel>
    ];
  }

  render() {
    const { isConnected } = this.props;
    const { tokenAddress, value } = this.state;
    const { isValid, errorMessage } = this.validate();

    return [
      <div
        key="content"
        className={classnames('swap__content', {
          'swap--inactive': !isConnected,
        })}
      >
        <NavigationTabs
          className={classnames('header__navigation', {
            'header--inactive': !isConnected,
          })}
        />
        <ModeSelector title="Remove Liquidity" />
        <CurrencyInputPanel
          title="Pool Tokens"
          extraText={this.getBalance(tokenAddress)}
          onValueChange={this.onInputChange}
          value={value}
          errorMessage={errorMessage}
          selectedTokenAddress={tokenAddress}
          onCurrencySelected={this.onTokenSelect}
          filteredTokens={['ETH']}
        />
        <OversizedPanel>
          <div className="swap__down-arrow-background">
            <img className="swap__down-arrow" src={isValid ? ArrowDownBlue : ArrowDownGrey} />
          </div>
        </OversizedPanel>
        { this.renderOutput() }
        <div className="pool__cta-container">
          <button
            className={classnames('pool__cta-btn', {
              'swap--inactive': !isConnected,
              'pool__cta-btn--inactive': !isValid,
            })}
            disabled={!isValid}
            onClick={this.onRemoveLiquidity}
          >
            Remove Liquidity
          </button>
        </div>
      </div>,
      this.renderSummary(errorMessage)
    ];
  }
}

export default connect(
  state => ({
    isConnected: Boolean(state.web3connect.account) && state.web3connect.networkId == (process.env.REACT_APP_NETWORK_ID||1),
    web3: state.web3connect.web3,
    balances: state.web3connect.balances,
    account: state.web3connect.account,
    exchangeAddresses: state.addresses.exchangeAddresses,
  }),
  dispatch => ({
    selectors: () => dispatch(selectors()),
    addPendingTx: id => dispatch(addPendingTx(id)),
  })
)(RemoveLiquidity);

function b(text) {
  return <span className="swap__highlight-text">{text}</span>
}
