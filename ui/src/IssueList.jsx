import React from 'react';
import URLSearchParams from 'url-search-params';
import {Route} from 'react-router-dom';
import {Panel} from 'react-bootstrap';

import IssueFilter from './IssueFilter.jsx';
import IssueTable from './IssueTable.jsx';
import IssueAdd from './IssueAdd.jsx';
import IssueDetail from './IssueDetail.jsx';
import graphQLFetch from './graphQLFetch.js';
import PanelHeading from 'react-bootstrap/lib/PanelHeading.js';
import Toast from './Toast.jsx';

export default class IssueList extends React.Component {
  constructor() {
    super();
    this.state = {
      issues: [],
      toastVisible: false,
      toastMessage: '',
      toastType: 'info',
    };
    this.createIssue = this.createIssue.bind(this);
    this.closeIssue = this.closeIssue.bind(this);
    this.deleteIssue = this.deleteIssue.bind(this);
    this.showSuccess = this.showSuccess.bind(this);
    this.showError = this.showError.bind(this);
    this.dismissToast = this.dismissToast.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    const {
      location: {search: prevSearch},
    } = prevProps;
    const {
      location: {search},
    } = this.props;
    if (prevSearch !== search) {
      this.loadData();
    }
  }

  async loadData() {
    const {
      location: {search},
    } = this.props;
    const params = new URLSearchParams(search);
    const vars = {};
    if (params.get('status')) vars.status = params.get('status');

    const effortMin = parseInt(params.get('effortMin'), 10);
    if (!Number.isNaN(effortMin)) vars.effortMin = effortMin;
    const effortMax = parseInt(params.get('effortMax'), 10);
    if (Number.isNaN(effortMax)) vars.effortMax = effortMax;

    const query = `query issueList(
      $status: StatusType
      $effortMin: Int
      $effortMax: Int
    ) {
      issueList(
        status: $status
        effortMin: $effortMin
        effortMax: $effortMax
      ){
        id title status owner
        created effort due
      }
    }`;

    const data = await graphQLFetch(query, vars, this.showError);
    if (data) {
      this.setState({issues: data.issueList});
    }
  }

  async createIssue(issue) {
    const query = `mutation issueAdd($issue: IssueInputs!) {
        issueAdd(issue: $issue) {
          id
        }
      }`;

    const data = await graphQLFetch(query, {issue}, this.showError);
    if (data) {
      this.loadData();
    }
  }

  async closeIssue(index) {
    const query = `mutation issueClose($id: Int!) {
      issueUpdate(id: $id, changes: { status: Closed }) {
        id title status owner
        effort created due description
      }
    }`;
    const {issues} = this.state;
    const data = await graphQLFetch(
      query,
      {id: issues[index].id},
      this.showError
    );
    if (data) {
      this.setState(prevState => {
        const newList = [...prevState.issues];
        newList[index] = data.issueUpdate;
        return {issues: newList};
      });
    } else {
      this.loadData();
    }
  }

  async deleteIssue(index) {
    const query = `mutation issueDelete($id: Int!) {
      issueDelete(id: $id)
    }`;
    const {issues} = this.state;
    const {
      location: {pathname, search},
      history,
    } = this.props;
    const {id} = issues[index];
    const data = await graphQLFetch(query, {id}, this.showError);
    if (data && data.issueDelete) {
      this.setState(prevState => {
        const newList = [...prevState.issues];
        if (pathname === `/issues/${id}`) {
          history.push({pathname: '/issues', search});
          this.showSuccess(`Deleted issue ${id} successfully.`);
        }
        newList.splice(index, 1);
        return {issues: newList};
      });
    } else {
      this.loadData();
    }
  }

  showSuccess(message) {
    this.setState({
      toastVisible: true,
      toastMessage: message,
      toastType: 'success',
    });
  }

  showError(message) {
    this.setState({
      toastVisible: true,
      toastMessage: message,
      toastType: 'danger',
    });
  }

  dismissToast() {
    this.setState({toastVisible: false});
  }

  render() {
    const {issues} = this.state;
    const {match} = this.props;
    const {toastVisible, toastType, toastMessage} = this.state;
    return (
      <React.Fragment>
        <Panel>
          <Panel.Heading>
            <Panel.Title toggle>Filter</Panel.Title>
          </Panel.Heading>
          <Panel.Body collapsible>
            <IssueFilter />
          </Panel.Body>
        </Panel>
        <hr />
        <IssueTable
          issues={issues}
          closeIssue={this.closeIssue}
          deleteIssue={this.deleteIssue}
        />
        <IssueAdd createIssue={this.createIssue} />
        <Route path={`${match.path}/:id`} component={IssueDetail} />
        <Toast
          showing={toastVisible}
          onDismiss={this.dismissToast}
          bsStyle={toastType}
        >
          {toastMessage}
        </Toast>
      </React.Fragment>
    );
  }
}
