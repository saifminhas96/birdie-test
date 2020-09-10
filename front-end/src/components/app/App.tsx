import "bootstrap/dist/css/bootstrap.min.css";
import * as React from "react";
import { createGlobalStyle } from "styled-components";
import { RootState } from "@App/store/reducers";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Calendar from "react-calendar";
import { Table, Container, Row, Col } from "react-bootstrap";

import Logo from "@App/components/Logo";
import DropdownList from "@App/components/DropdownList";

import Fetcher from "../../util/Fetcher";

const LogoUrl = require("../../assets/images/logo-birdie.svg");

interface AppProps {}

interface AppState {
  recipients: Array<any>;
  listValue: string;
  date: Date;
  events: Array<any>;
}

const GlobalStyle = createGlobalStyle`
  body {
    height: 100vh;
    background-color: #F9F9F9;
    > div {
      height: 100%;
    }
  }
`;

// const AppContainer = styled.div`
//   width: 100%;
//   height: 100%;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   flex-direction: column;
// `;

const SelectedRecipient = (props: any) => {
  return <p>Selected recepient: {props.recipient}</p>;
};

const EventSection = (props: any) => {
  return (
    <Table striped={true} bordered={true} hover={true} variant="dark">
      <thead>
        <th>Time of the event</th>
        <th>Event</th>
      </thead>
      <tbody>
        {props.events.map((event: any, key: number) => {
          return (
            <tr key={key}>
              <td>{event.timestamp}</td>
              <td>{event.event_type}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

class App extends React.Component<AppProps, AppState> {
  public constructor(props: AppProps) {
    super(props);
    this.dropdownHandler = this.dropdownHandler.bind(this);
    this.state = {
      recipients: [],
      listValue: "not selected yet",
      date: new Date(),
      events: [],
    };
  }

  // Lifecycle methods
  componentWillMount() {
    this.fetchRecipients();
  }

  public render() {
    return (
      <>
        <GlobalStyle />
        <Container>
          <Logo src={LogoUrl} />
          <h5 className="mt-3">
            Select recipent and then date to see what happened to the patient on
            this day.
          </h5>

          <Row className="mt-3">
            <Col className="d-flex justify-content-center">
              <div>
                <DropdownList
                  recipients={this.state.recipients}
                  changeHandler={this.dropdownHandler}
                  listValue={this.state.listValue}
                />

                <SelectedRecipient recipient={this.state.listValue} />
              </div>
            </Col>
            <Col className="pb-3">
              <Calendar
                onChange={this.calendarChange}
                value={this.state.date}
              />
            </Col>
          </Row>

          <EventSection events={this.state.events} />
        </Container>
      </>
    );
  }

  private calendarChange = (date: Date) => {
    console.log(`date selected: ${date}`);
    this.setState({ date });
    this.fetchEvents(this.state.listValue, this.state.date);
  };

  private dropdownHandler = (eventKey: any, _: any) => {
    this.setState({ listValue: eventKey });
  };

  private async fetchEvents(recipient: string, date: Date) {
    const body = await Fetcher.getEvents(recipient, date);
    if (body == null) {
      alert("There was problem fetching the recipients! Please refresh!");
    } else {
      this.setState({ events: this.normalizeEvents(body) });
    }
  }

  private async fetchRecipients() {
    const body = await Fetcher.getRecipients();
    if (body == null) {
      alert("There was problem fetching the recipients! Please refresh!");
    } else {
      this.setState({ recipients: body });
    }
  }

  private normalizeEvents(events: Array<any>) {
    return events.map((event) => {
      return {
        timestamp: new Date(event.timestamp).toTimeString().slice(0, 8),
        event_type: event.event_type.split("_").map((s: string) => {
          return s.charAt(0).toUpperCase() + s.slice(1) + " ";
        }),
      };
    });
  }
}

const mapStateToProps = (state: RootState, ownProps: object) => {};

const mapDispatchToProps = (dispatch: Dispatch<RootState>) => {};

export default connect(mapStateToProps, mapDispatchToProps)(App);
