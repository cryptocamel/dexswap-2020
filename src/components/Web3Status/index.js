import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import Web3 from 'web3';
import Jazzicon from 'jazzicon';
import { CSSTransitionGroup } from "react-transition-group";
import './web3-status.scss';
import Modal from '../Modal';

function getEtherscanLink(tx) {
  return `https://etherscan.io/tx/${tx}`;
}

class Web3Status extends Component {
  state = {
    isShowingModal: false,
  };

  handleClick = () => {
    if (this.props.pending.length && !this.state.isShowingModal) {
      this.setState({isShowingModal: true});
    }
  };

  renderPendingTransactions() {
    return this.props.pending.map((transaction) => {
      return (
        <div
          key={transaction}
          className={classnames('pending-modal__transaction-row')}
          onClick={() => window.open(getEtherscanLink(transaction), '_blank')}
        >
          <div className="pending-modal__transaction-label">
            {transaction}
          </div>
          <div className="pending-modal__pending-indicator">
            <div className="loader" /> Pending
          </div>
        </div>
      );
    });
  }

  renderModal() {
    if (!this.state.isShowingModal) {
      return null;
    }

    return (
      <Modal onClose={() => this.setState({ isShowingModal: false })}>
        <CSSTransitionGroup
          transitionName="token-modal"
          transitionAppear={true}
          transitionLeave={true}
          transitionAppearTimeout={200}
          transitionLeaveTimeout={200}
          transitionEnterTimeout={200}
        >
          <div className="pending-modal">
            <div className="pending-modal__transaction-list">
              <div className="pending-modal__header">Transactions</div>
              {this.renderPendingTransactions()}
            </div>
          </div>
        </CSSTransitionGroup>
      </Modal>
    );
  }

  render() {
    const { address, pending, confirmed } = this.props;
    const hasPendingTransactions = !!pending.length;
    const hasConfirmedTransactions = !!confirmed.length;

    return (
      <div
        className={classnames("web3-status", {
          'web3-status__connected': this.props.isConnected,
          'web3-status--pending': hasPendingTransactions,
          'web3-status--confirmed': hasConfirmedTransactions,
        })}
        onClick={this.handleClick}
      >
        <div className="web3-status__text">
          { hasPendingTransactions ? getPendingText(pending) : getText(address) }
        </div>
        <div
          className="web3-status__identicon"
          ref={el => {
            if (!el) {
              return;
            }

            if (!address|| address.length < 42 || !Web3.utils.isHexStrict(address)) {
              return;
            }

            el.innerHTML = '';
            el.appendChild(Jazzicon(16, parseInt(address.slice(2), 16)));
          }}
        />
        {this.renderModal()}
      </div>
    );
  }
}



function getPendingText(pendingTransactions) {
  return (
    <div className="web3-status__pending-container">
      <div className="loader" />
      <span key="text">{pendingTransactions.length} Pending</span>
    </div>
  );
}

function getText(text) {
  if (!text || text.length < 42 || !Web3.utils.isHexStrict(text)) {
    return 'Disconnected';
  }

  const address = Web3.utils.toChecksumAddress(text);
  return `${address.substring(0, 6)}...${address.substring(38)}`;
}

Web3Status.propTypes = {
  isConnected: PropTypes.bool,
  address: PropTypes.string,
};

Web3Status.defaultProps = {
  isConnected: false,
  address: 'Disconnected',
};

export default connect(
  state => {
    return {
      address: state.web3connect.account,
      isConnected: !!(state.web3connect.web3 && state.web3connect.account),
      pending: state.web3connect.transactions.pending,
      confirmed: state.web3connect.transactions.confirmed,
    };
  }
)(Web3Status);
