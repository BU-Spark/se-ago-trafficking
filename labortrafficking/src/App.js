import React, { Component } from 'react';
import logo from './logo.svg';
import menu from './menu.svg';
import instructions from './instructions.jpg';
import instructions1 from './instructions1.jpg';
import instructions2 from './instructions2.jpg';
import instructions3 from './instructions3.jpg';
import instructions4 from './instructions4.jpg';
import YesImg from './Yes.png';
import NoImg from './No.png';
import MaybeImg from './Maybe.png';
import Warning from './Warning.svg';
import './App.css';
import Question from './components/Question';
import SeriousHarmquizQuestions from './api/SeriousHarmquizQuestions';
import AbuseofLawquizQuestions from './api/AbuseofLawquizQuestions';
import ExtortionquizQuestions from './api/ExtortionquizQuestions';
import FinancialHarmquizQuestions from './api/FinancialHarmquizQuestions';
import RestraintquizQuestions from './api/RestraintquizQuestions';
import IdentityDocumentsquizQuestions from './api/IdentityDocumentsquizQuestions';
import Quiz from './components/Quiz';
import Result from './components/Result';
import update from 'react-addons-update';
import Popup from "reactjs-popup";
import jsPDF from 'jspdf';
import YellowBox from './structures/yellowBox';
import BlueBox from './structures/blueBox';
import NormalText from './structures/normalText';
import QuestionBox from './structures/questionBox';
import AssessmentBox from './structures/assessmentBox';
import Expandable from './structures/expandable';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
     counter: 0,
     questionId: 1,
     qcategory: 1,
     qcategory_old: 1,
     question: [],
     answerOptions: [],
     Answer: new Array(14).fill(''),
     line: 0,
     page: 1,
     page_old: 1,
     addpage: 0,
     result: '',
     doc : new jsPDF(),
     answersCount: {
       No: 0,
       Yes: 0,
       Maybe: 0
     },
     mobileMenu: false,
     resourcesPage: 0,
     disclaimer: false,
    };
    this.handleAnswerSelected = this.handleAnswerSelected.bind(this);
    this.evaluateNow = this.evaluateNow.bind(this);
    this._onAssessClick = this._onAssessClick.bind(this);
    this._onPrepareClick = this._onPrepareClick.bind(this);
    this.sHarmQuizFunc = this.sHarmQuizFunc.bind(this);
    this.restraintQuizFunc = this.restraintQuizFunc.bind(this);
    this.abuseQuizFunc = this.abuseQuizFunc.bind(this);
    this.identitydocQuizFunc = this.identitydocQuizFunc.bind(this);
    this.extortionQuizFunc = this.extortionQuizFunc.bind(this);
    this.fharmQuizFunc = this.fharmQuizFunc.bind(this);
    this._onCompleteClick = this._onCompleteClick.bind(this);
    this._onResourcesClick = this._onResourcesClick.bind(this);
    this._onVictimClick = this._onVictimClick.bind(this);
    this._onMassClick = this._onMassClick.bind(this);
    this._onReportClick = this._onReportClick.bind(this);
    this.downloadPdf = this.downloadPdf.bind(this);
    this.handleResourcesClick = this.handleResourcesClick.bind(this);
    this.renderQuestions = this.renderQuestions.bind(this);
    this.renderMassStatute = this.renderMassStatute.bind(this);
    this.renderReport = this.renderReport.bind(this);

  }

  componentDidMount() {
    this.scrollToTop();
  }

  componentDidUpdate() {
    //this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo(0, 0)
  }

  shuffleArray(array) {
    return array;
  };

  writePdf(answer) {

    var a = this.state.line + 20;
    if (a > 297) {
      a = 20;
    }
    var b = a + 10;
    if (b > 297) {
      b = 20;
    }
    var c = b + 10;
    if (c > 297) {
      c = 20;
    }
    this.state.doc.text('Question No. ' + String(this.state.questionId), 10, a);
    this.state.doc.text(String(this.state.question[0]), 10, b);
    this.state.doc.text('Chosen Answer: ' + String(answer), 10, c);
    this.setState({line: c});
  }

  downloadPdf() {
    this.state.doc.save('Assessment Results.pdf');
  }


  getResults() {
    let answerKey = [];
    answerKey[1] = [1, 2, 3, 4, 5];
    answerKey[2] = [1, 2, 3, 4, 5];
    answerKey[3] = [1, 2, 3];
    answerKey[4] = [1, 2, 3, 4];
    answerKey[5] = [1, 2, 3];
    answerKey[6] = [];

    for( let i =0; i<answerKey[this.state.qcategory].length; i++){
      let answer = answerKey[this.state.qcategory][i];
      if(this.state.Answer[answer] == 'Yes')
        return ['Yes'];
    }

    const answersCount = this.state.answersCount;

    for(let i=1; i<=this.state.Answer.length; i++)
      if(this.state.Answer[i] != '')
        answersCount[this.state.Answer[i]]++;

    const answersCountKeys = Object.keys(answersCount);
    const answersCountValues = answersCountKeys.map((key) => answersCount[key]);
    const maxAnswerCount = Math.max.apply(null, answersCountValues);
    return answersCountKeys.filter((key) => answersCount[key] === maxAnswerCount);
  }

  setResults (result) {
    this.setState({Answer: new Array(14).fill('')});
    if (result.length === 1) {
      // const a = this.state.line + 20;
      // this.state.doc.text('Labor Trafficking case: ' + String(result[0]), 10, a);
      this.setState({ result: result[0], page: 5 });
    } else {
      // const a = this.state.line + 20;
      // this.state.doc.text('Labor Trafficking case: Maybe', 10, a);
      this.setState({ result: 'Maybe', page: 5 });
    }
  }


  handleAnswerSelected(event) {
    let ul = event.currentTarget.parentElement.parentElement;
    let active = ul.getElementsByClassName('QuizActive');
    for(let item of active){
      item.classList.remove('QuizActive');
    };
    event.currentTarget.parentElement.classList.add('QuizActive');

    const answer = event.currentTarget.value;
    //this.writePdf(answer);
    var ans = answer.split('_');
    const updatedAnswersCount = update(this.state.answersCount, {
      [answer]: {$apply: (currentValue) => currentValue + 1}
    });

    if(typeof(ans[1]) == "string")
      if(ans[1] >= 1 && ans[1] <= this.state.Answer.length)
        this.state.Answer[ans[1]] = ans[0];
  }


  evaluateNow() {
    this.setResults(this.getResults());
  }


  renderQuestions(questions){
    return (
      <div>
        <div class="AssessmentQuestions">
          {
            (function (){
              let JSXarray = [];
              for( let i=0; i<questions.length; i++){
                JSXarray.push((
                  <Quiz
                    answer={this.state.Answer[i+1]}
                    questionId={this.state.questionId+i}
                    question={this.state.question[i].question}
                    questionTotal={questions.length}
                    onAnswerSelected={this.handleAnswerSelected}
                  />
                ));
              }
              return JSXarray;
            }).bind(this)()
          }
        </div>
        <div style={{backgroundColor : "#fff", padding: "10px 20px", textAlign : "right"}}>
          <button class="button1" style={{float : "unset", marginRight : "10px"}} onClick={this.evaluateNow}>Evaluate</button>
          <button class="button3" style={{float : "unset"}} onClick={this._onAssessClick}>Categories</button>
        </div>
      </div>
    );
  }

  renderHarmQuiz() {
    return (
      <div>
        <div class="App" >
          <p class="pageTitle">Assess</p>
          <p class="Head">Question: Serious Harm</p>
          <p class="regularText" style={{"fontWeight" : "bold"}}>Causes or threatens to cause serious harm to any person</p>
        </div>
        <Expandable content={
          <div class="App">
            <br />
            <p class="regularText" style={{"fontWeight" : "bold"}}>Lay Definition</p>
            <p class="regularText">Serious harm may be physical and nonphysical, including psychological, financial, or reputational harm. Generally, the test contemplates whether it is sufficiently serious, under all the surrounding circumstances, to compel a reasonable person of the same background and in the same circumstances to perform or to continue performing labor or services in order to avoid incurring that harm. </p>
            <br />
            <p class="regularText" style={{"fontWeight" : "bold"}}>Legal Definition</p>
            <p class="regularText">Serious harm is defined federally as any harm, whether physical or nonphysical, including psychological, financial, or reputational harm, that is sufficiently serious, under all the surrounding circumstances, to compel a reasonable person of the same background and in the same circumstances to perform or to continue performing labor or services in order to avoid incurring that harm. 18 USC ?? 1589 (c)(2).</p>
            <br />
            <p class="regularText" style={{"fontWeight" : "bold"}}>Examples</p>
            <ul>
              <li>
                <p class="regularText">An employer kicks the worker in the morning to wake her up and to start working.</p>
              </li>
              <li>
                <p class="regularText">When the worker asks for their wages, the employers gets angry and hits the worker.</p>
              </li>
            </ul>
          </div>
        } />
        {this.renderQuestions(SeriousHarmquizQuestions)}
      </div>
    );
  }

  renderRestraintQuiz() {
    return (
      <div>
        <div class="App" >
          <p class="pageTitle">Assess</p>
          <p class="Head">Question: Physical Restraint</p>
          <p class="regularText" style={{"fontWeight" : "bold"}}>Physically restrains or threatens to physically restrain another person	</p>
        </div>
        <Expandable content={
          <div class="App">
            <br />
            <p class="regularText" style={{"fontWeight" : "bold"}}>Lay Definition</p>
            <p class="regularText">Physical restraint means purposely limiting or obstructing the freedom of a person???s bodily movement. This can range from using locks on doors or windows to more subtle forms of control that restrict another person???s ability to move around.</p>
            <br />
            <p class="regularText" style={{"fontWeight" : "bold"}}>Example</p>
            <ul>
              <li>
                <p class="regularText">A domestic worker is brought to the United States by an employer. Her employers do not permit her to leave the house unaccompanied, and her movement is monitored by cameras.</p>
              </li>
            </ul>
          </div>
        } />
        {this.renderQuestions(RestraintquizQuestions)}
      </div>
    );
  }

  renderAbuseQuiz() {
    return (
      <div>
        <div class="App" >
          <p class="pageTitle">Assess</p>
          <p class="Head">Question: Abuse of the Law</p>
          <p class="regularText" style={{"fontWeight" : "bold"}}>Abuses or threatens to abuse the law or legal process	</p>
        </div>
        <Expandable content={
          <div class="App">
            <br />
            <p class="regularText" style={{"fontWeight" : "bold"}}>Lay Definition</p>
            <p class="regularText">Abuse of the legal process includes the use or threatened use of a law or legal process, whether administrative, civil, or criminal, in any manner or for any purpose for which the law was not designed. A common example is a threat of deportation by an employer.</p>
            <br />
            <p class="regularText" style={{"fontWeight" : "bold"}}>Legal Definition</p>
            <p class="regularText">Abuse of the legal process federally is defined as the use or threatened use of a law or legal process, whether administrative, civil, or criminal, in any manner or for any purpose for which the law was not designed, in order to exert pressure on another person to cause that person to take some action or refrain from taking some action. 22 U.S.C. ?? 7102(1).</p>
            <br />
            <p class="regularText" style={{"fontWeight" : "bold"}}>Examples</p>
            <ul>
              <li>
                <p class="regularText">An employer threatens to deport the worker or "call immigration" on them if they stopped working for the employer.</p>
              </li>
              <li>
                <p class="regularText">An employer threatens to falsely accuse the worker of a crime if she fails to work.</p>
              </li>
            </ul>
          </div>
        } />
        {this.renderQuestions(AbuseofLawquizQuestions)}
      </div>
    );
  }

  renderIdentityQuiz() {
    return (
      <div>
        <div class="App" >
          <p class="pageTitle">Assess</p>
          <p class="Head">Question: Identity Documents</p>
          <p class="regularText" style={{"fontWeight" : "bold"}}>Knowingly destroys, conceals, removes, confiscates or possesses any actual or purported passport or other immigration document, or any other actual or purported government identification document, of another person.</p>
        </div>
        <Expandable content={
          <div class="App">
            <br />
            <p class="regularText" style={{"fontWeight" : "bold"}}>Lay Definition</p>
            <p class="regularText">This includes taking someone???s passport for any period of time, even if it is brief. In addition, it can include tearing or mutilating identity documents related to work.</p>
            <br />
            <p class="regularText" style={{"fontWeight" : "bold"}}>Example</p>
            <ul>
              <li>
                <p class="regularText">An employer demands that the worker give her the worker???s passport and keeps it in an undisclosed location.</p>
              </li>
            </ul>
          </div>
        } />
        {this.renderQuestions(IdentityDocumentsquizQuestions)}
      </div>
    );
  }

  renderExtortionQuiz() {
    return (
      <div>
        <div class="App" >
          <p class="pageTitle">Assess</p>
          <p class="Head">Question: Extortion</p>
          <p class="regularText" style={{"fontWeight" : "bold"}}>Engages in extortion under Massachusetts law	</p>
        </div>
        <Expandable content={
          <div class="App">
            <br />
            <p class="regularText" style={{"fontWeight" : "bold"}}>Lay Definition</p>
            <p class="regularText">Extortion is the practice of trying to get something through force, threats, or blackmail. For example, extortion may involve a perpetrator who threatens to release embarrassing photographs, unless the victim continues to work.</p>
            <br />
            <p class="regularText" style={{"fontWeight" : "bold"}}>Legal Definition</p>
            <p class="regularText">"Whoever, verbally or by a written or printed communication, maliciously threatens to accuse another of a crime or offence, or by a verbal or written or printed communication maliciously threatens an injury to the person or property of another, or any police officer or person having the powers of a police officer, or any officer, or employee of any licensing authority who verbally or by written or printed communication maliciously and unlawfully uses or threatens to use against another the power or authority vested in him, with intent thereby to extort money or any pecuniary advantage, or with intent to compel any person to do any act against his will, shall be punished by imprisonment in the state prison for not more than fifteen years, or in the house of correction for not more than two and one half years, or by a fine of not more than five thousand dollars, or both." M.G.L. ch. 265, ?? 25.</p>
          </div>
        } />
        {this.renderQuestions(ExtortionquizQuestions)}
      </div>
    );
  }

  renderfHarmQuiz() {
    return (
      <div>
        <div class="App" >
          <p class="pageTitle">Assess</p>
          <p class="Head">Question: Financial Harm</p>
          <p class="regularText" style={{"fontWeight" : "bold"}}>Causes or threatens to cause financial harm to any person.</p>
        </div>
        <Expandable content={
          <div class="App">
            <br />
            <p class="regularText" style={{"fontWeight" : "bold"}}>Lay Definition</p>
            <p class="regularText">Financial harm may be involved if the perpetrator puts the victim in a detrimental position in relation to wealth, property, or other monetary benefits through extortion, criminal usury, or illegal employment contracts. This might include a situation where the perpetrator uses an illegal employment contract to lure a victim to work in demeaning conditions.</p>
            <br />
            <p class="regularText" style={{"fontWeight" : "bold"}}>Legal Definition</p>
            <p class="regularText">???Financial harm??? is defined as a detrimental position in relation to wealth, property or other monetary benefits that occurs as a result of another person???s illegal act including, but not limited to, extortion under by section 25, a violation of section 49 of chapter 271 (???Criminal Usury???), or illegal employment contracts.??? M.G.L. ch. 265, ?? 49.</p>
            <br />
            <p class="regularText" style={{"fontWeight" : "bold"}}>Examples</p>
            <ul>
              <li>
                <p class="regularText">An employer refuses to pay wages to the worker for the work they have done.</p>
              </li>
              <li>
                <p class="regularText">A worker makes one mistake on the job, and the employer refuses to pay the worker that week.</p>
              </li>
              <li>
                <p class="regularText">An employer makes the worker work long hours, late into the night, without even allowing him a break to eat dinner.</p>
              </li>
            </ul>
          </div>
        } />
        {this.renderQuestions(FinancialHarmquizQuestions)}
      </div>
    );
  }

  renderImgTick() {
    return (
      <img src={YesImg} class="modalImg" alt="Result"/>
    );
  }

  renderImgCross() {
    return (
      <img src={NoImg} class="modalImg" alt="Result"/>
    );
  }

  renderImgQues() {
    return (
      <img src={MaybeImg} class="modalImg" alt="Result"/>
    );
  }

  renderResult() {
    return (
        <div>
          <Popup
            open={true}
            contentStyle={{ maxWidth: "600px", height: "400px", width: "90%", overflow: "auto" }}>
            {close => (
              <div>
                <button class="modalClose" onClick={() => {close(); this._onAssessClic}}>&#215;</button>
                <div className="header">
                  <p class="modalCategory">Results for:</p>
                </div>
                <div className="header">
                  <p>
                    {
                        this.state.qcategory == 1 ? "Serious Harm" : this.state.qcategory == 2 ?
                                                  "Physical Restraint" : this.state.qcategory == 3 ? "Abuse of the Law" :
                                                  this.state.qcategory == 4 ? "Identity Documents" : this.state.qcategory == 5 ?
                                                  "Extortion" : "Financial Harm"
                    }
                  </p>
                </div>

                {this.state.result == 'Yes' ? this.renderImgTick() : this.state.result == 'No' ? this.renderImgCross() : this.renderImgQues()}

                <div style={{paddingTop: "20px"}} class="header">
                  <p>Report &amp; Find Victim Services</p>
                </div>
                <Result quizResult={this.state.result} />
                <div class="actions">
                  <div>
                    <button className="button1" style={{float : "unset", marginRight: "10px"}} onClick={this._onReportClick}>Report</button>
                    <button className="button3" style={{float : "unset"}} onClick={this._onResourcesClick}>Victim Services</button>
                  </div>
                </div>
                <br/>
              </div>
            )}
          </Popup>
        </div>
    );
  }

  renderHome() {
    return (
      <div className="App">
        <br class="hidden-lg hidden-md" />
        <p className="HomeHead hidden-sm hidden-xs">Labor Trafficking <br />Identification Tool</p>
        <p className="Head hidden-lg hidden-md">Labor Trafficking <br />Identification Tool</p>
      <div class="ButBar">
        <p className="HomeHead1">A tool to help investigators identify labor trafficking under Massachusetts law.<br></br></p>
        <div className="buttonContainer hidden-xs hidden-sm">
          <button type="button" class="button3" onClick={this._onPrepareClick}>Prepare</button>
          <button type="button" class="button1" onClick={this._onAssessClick} >Begin</button>
        </div>
      </div>
      <picture class="homeInstruction hidden-xs hidden-sm">
        <source srcset={instructions1} media= "(max-width: 760px)"/>
        <img src={instructions} alt="Instructions" className = "Desc-Image"/>
      </picture>
      <picture class="hidden-xs hidden-sm">
        <source srcset={instructions2} media= "(max-width: 760px)"/>
        <img src="" className = "Desc-Image"/>
      </picture>
      <picture class="hidden-xs hidden-sm">
        <source srcset={instructions3} media= "(max-width: 760px)"/>
        <img src="" className = "Desc-Image"/>
      </picture>
      <picture class="hidden-xs hidden-sm">
        <source srcset={instructions4} media= "(max-width: 760px)"/>
        <img src="" className = "Desc-Image"/>
      </picture>
      <div class="buttonContainer hidden-md hidden-lg">
        <button class="button4" onClick={this._onPrepareClick}><h1>Prepare</h1><p>Tips for interviewing victims</p></button>
        <button class="button4" onClick={this._onAssessClick}><h1>Assess</h1><p>Is this case trafficking?</p></button>
        <button class="button4">
          <div onClick={this._onReportClick} style={{position: "absolute", left : "0", top : "0", width: "100%", height: "100%"}}></div>
          <h1>Resources</h1>
          <p>
            <span style={{textDecoration : "underline"}}>Report</span>&nbsp;and&nbsp;
            <span style={{textDecoration : "underline", position : "relative"}}>
              <div onClick={this._onResourcesClick} style={{position : "absolute", width: "100%", height: "100%", zIndex: "100", left : "0", top : "0"}}></div>
              Victim Services
            </span>
          </p>
        </button>
        <button class="button4" onClick={this._onMassClick}><h1>Massachusetts Law</h1><p>View the Massachusetts labor trafficking statute</p></button>
      </div>
      </div>
    );
  }

  prepareFunc() {
    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight && panel != null){
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    }
  }

  _onPrepareClick() {
    this.setState({
      page: 2,
      mobileMenu: false,
    });
  }

  _onAssessClick() {
    this.setState({
      page: 3,
      mobileMenu: false,
      Answer: new Array(14).fill(''),
    });
  }

  sHarmQuizFunc() {
    const shuffledAnswerOptions = SeriousHarmquizQuestions.map((question) => this.shuffleArray(question.answers));
    this.setState({
      page: 4,
      questionId: 1,
      question: SeriousHarmquizQuestions,
      answerOptions: shuffledAnswerOptions[0],
      qcategory: 1
    });

  }
  restraintQuizFunc() {
    const shuffledAnswerOptions = RestraintquizQuestions.map((question) => this.shuffleArray(question.answers));
    this.setState({
      page: 4,
      questionId: 1,
      question: RestraintquizQuestions,
      answerOptions: shuffledAnswerOptions[0],
      qcategory: 2
    });

  }
  abuseQuizFunc() {
    const shuffledAnswerOptions = AbuseofLawquizQuestions.map((question) => this.shuffleArray(question.answers));
    this.setState({
      page: 4,
      questionId: 1,
      question: AbuseofLawquizQuestions,
      answerOptions: shuffledAnswerOptions[0],
      qcategory: 3
    });

  }
  identitydocQuizFunc() {
    const shuffledAnswerOptions = IdentityDocumentsquizQuestions.map((question) => this.shuffleArray(question.answers));
    this.setState({
      page: 4,
      questionId: 1,
      question: IdentityDocumentsquizQuestions,
      answerOptions: shuffledAnswerOptions[0],
      qcategory: 4
    });

  }
  extortionQuizFunc() {
    const shuffledAnswerOptions = ExtortionquizQuestions.map((question) => this.shuffleArray(question.answers));
    this.setState({
      page: 4,
      questionId: 1,
      question: ExtortionquizQuestions,
      answerOptions: shuffledAnswerOptions[0],
      qcategory: 5
    });

  }
  fharmQuizFunc() {
    const shuffledAnswerOptions = FinancialHarmquizQuestions.map((question) => this.shuffleArray(question.answers));
    this.setState({
      page: 4,
      questionId: 1,
      question: FinancialHarmquizQuestions,
      answerOptions: shuffledAnswerOptions[0],
      qcategory: 6
    });

  }

  _onCompleteClick() {
    this.setState({
      page: 1,
      mobileMenu: false,
    });
  }

  _onResultClick() {
    this.setState({
      page: 5,
      mobileMenu: false,
    });
  }

  _onVictimClick() {
    this.setState({
      page: 6,
      mobileMenu: false,
    });
  }

  _onResourcesClick(){
    this.setState({
      page: 6,
      mobileMenu: false,
    });
  }

  _onMassClick(){
    this.setState({
      page: 7,
      mobileMenu: false,
    })
  }

  _onReportClick(){
    this.setState({
      page: 8,
      mobileMenu: false,
    })
  }

  renderPrepare() {
    let blueBoxContainer = "prepareBlueBoxContainer";
    let blueBox = "prepareBlueBox";

    return (
      <div>
        <div className="App">
          <p class="pageTitle">Prepare</p>
          <p class="Head">Tips for interviewing Victims</p>
          <p className="HomeHead1">What to think about before you interview the victim<br></br></p>
        </div>

        <div className="prep1 resourcesContent">
          <QuestionBox title={<h1>Tip 1: Develop trust</h1>} html={(
            <BlueBox blueBoxContainer={blueBoxContainer} blueBox={blueBox} html={(
              <div>
                <h1 style={{fontWeight:"bold", marginBottom: "5px"}}>Confidentiality limitations</h1>
                <h2 style={{fontWeight:"normal", marginBottom: "15px"}}>You will not be able to keep details disclosed by the victim confidential. Explain  this at the beginning so the victim will understand your role and not feel betrayed if you have to share information with prosecutors or other government officials.</h2>
                <h1 style={{fontWeight:"bold", marginBottom: "5px"}}>Be patient</h1>
                <ul style={{"list-style-type": "disc", "padding-left": "16px", "margin": "0px", "font-size": "13px"}}>
                  <li>
                    <h2 style={{fontWeight:"normal"}}>Establishing trust with the victim may be difficult during initial interviews. Victims may not initially divulge key details due to fear.</h2>
                  </li>
                  <li>
                    <h2 style={{fontWeight:"normal", marginBottom: "15px"}}>In the human trafficking context, it is common to engage in multiple interviews as trust develops. It is also common that there may be initial inconsistencies as a result of distrust or the victim???s lack of understanding about the legal process.</h2>
                  </li>
                </ul>
                <h1 style={{fontWeight:"bold", marginBottom: "5px"}}>Referrals/resources</h1>
                <h2 style={{fontWeight:"normal", marginBottom: "15px"}}>Make referrals to appropriate legal, social, and mental health services as soon as possible to establish trust and to ensure the victim receives needed support. <span style={{"font-weight" : "bold"}}>See Tip 5 for more information.</span></h2>
                <h1 style={{fontWeight:"bold", marginBottom: "5px"}}>Communication</h1>
                <h2 style={{fontWeight:"normal"}}>If there are language barriers, trust will be nearly impossible to establish without a skilled interpreter. <span style={{"font-weight" : "bold"}}>See Tip 4 below to learn about when to use an interpreter.</span></h2>
              </div>
            )} />
          )} />

          <QuestionBox title={<h1>Tip 2: Engage in safety planning</h1>} html={(
            <BlueBox blueBoxContainer={blueBoxContainer} blueBox={blueBox} html={(
              <div>
                <h1 style={{fontWeight:"bold", marginBottom: "5px"}}>Safety planning is very important</h1>
                <ul style={{"list-style-type": "disc", "padding-left": "16px", "margin": "0px", "font-size": "13px"}}>
                  <li>
                    <h2 style={{fontWeight:"normal"}}>Ask about the victim???s immediate safety and take appropriate steps to ensure safety both before and after interviewing.</h2>
                  </li>
                  <li>
                    <h2 style={{fontWeight:"normal", marginBottom: "15px"}}>Involve a victim advocate in the process as soon as possible. <span class="prepareLink" onClick={()=>{this._onResourcesClick(); this.handleResourcesClick(1)}}>Click here for a list of questions to consider when thinking about safety planning.</span></h2>
                  </li>
                </ul>
                <h1 style={{fontWeight:"bold", marginBottom: "5px"}}>Remember</h1>
                <ul style={{"list-style-type": "disc", "padding-left": "16px", "margin": "0px", "font-size": "13px"}}>
                  <li>
                    <h2 style={{fontWeight:"normal"}}>Victims may be fearful of reprisals to themselves and their family members.</h2>
                  </li>
                  <li>
                    <h2 style={{fontWeight:"normal", marginBottom: "15px"}}>The victim may need to work to continue to repay debt and/or to support family members here or abroad.</h2>
                  </li>
                </ul>
                <h2 style={{fontWeight:"normal"}}>Some undocumented victims may be eligible for work authorization. <span class="prepareLink" onClick={()=>{this._onResourcesClick(); this.handleResourcesClick(0)}}>Click here to learn more about immigration relief.</span></h2>
                <h2 style={{fontWeight:"normal"}}>Make referrals to organizations that can assist with safety planning. <span class="prepareLink" onClick={this._onResourcesClick}>Click here to learn about available victim services.</span></h2>
              </div>
            )} />
          )} />

          <QuestionBox title={<h1>Tip 3: Lack of immigration status may create significant barriers to reporting trafficking</h1>} html={(
            <BlueBox blueBoxContainer={blueBoxContainer} blueBox={blueBox} html={(
              <div>
                <h2 style={{fontWeight:"normal"}}>Undocumented victims are particularly at risk for human trafficking and may fear engaging with law enforcement.</h2>
                <h2 style={{fontWeight:"normal", marginBottom: "15px"}}>Immigration threats are often used as a means of power and control over the victim. If the victim is undocumented or if you are unsure of the victim???s immigration status, make a referral immediately to an experienced immigration attorney. <span class="prepareLink" onClick={()=>{this._onResourcesClick(); this.handleResourcesClick(2)}}>Click here for a list of local immigration legal services providers.</span></h2>
              </div>
            )} />
          )} />

          <QuestionBox title={<h1>Tip 4: Use a qualified interpreter</h1>} html={(
            <BlueBox blueBoxContainer={blueBoxContainer} blueBox={blueBox} html={(
              <div>
                <h2 style={{fontWeight:"normal"}}>It is important to use skilled, culturally competent interpreters to assist in interviews with victims who have limited English proficiency.</h2>
                <h2 style={{fontWeight:"normal"}}>Always ask the victim about any languages he or she speaks and in what language he or she prefers to communicate.</h2>
                <h2 style={{fontWeight:"normal"}}>In-person interpretation is preferable.</h2>
                <h2 style={{fontWeight:"normal"}}>Before the interview, screen your interpreter to make sure he or she is not involved in the case and does not have connections to the suspect. Often, ethnic communities can be small, and it is essential that the interpreter has no relationship with the suspect and understands the importance of confidentiality.</h2>
                <h2 style={{fontWeight:"normal"}}>Understand that there may be stigma and subtle cultural considerations that can affect the victim???s disclosures to interpreters. For example, a victim may not feel comfortable disclosing about a sexual assault in front of someone from his or her same ethnicity fearing stigma or blame.</h2>
              </div>
            )} />
          )} />

          <QuestionBox title={<h1>Tip 5: Make referrals to appropriate victim services as soon as possible</h1>} html={(
            <BlueBox blueBoxContainer={blueBoxContainer} blueBox={blueBox} html={(
              <div>
                <h1 style={{fontWeight:"bold"}}>Make appropriate referrals to victim services </h1>
                <h2 style={{fontWeight:"normal"}}>The first priority is ensuring that the victim???s basic needs are met. This includes access to safe housing, mental health services, medical services, and food. <span class="prepareLink" onClick={()=>{this._onResourcesClick(); this.handleResourcesClick(0)}}>Click here to learn more about available victim services.</span></h2>
                <h2 style={{fontWeight:"normal"}}> It is important to refer the victim to an attorney as soon as possible to ensure that he or she can learn about his or her rights. A victim of labor trafficking may be eligible for certain protections under law, such as victim compensation, criminal restitution, immigration relief, and civil remedies. <span class="prepareLink" onClick={()=>{this._onResourcesClick(); this.handleResourcesClick(3)}}>Click here to learn more about available legal services and how to make referral.</span></h2>
              </div>
            )} />
          )} />

          <QuestionBox title={<h1>Tip 6: How to engage with the victim</h1>} html={(
            <BlueBox blueBoxContainer={blueBoxContainer} blueBox={blueBox} html={(
              <div>
                <h2 style={{fontWeight:"normal"}}>At the outset, allowing the victim to tell as much or as little of his/her experience as he or she is comfortable is key in building trust and a successful investigation.</h2>
                <h2 style={{fontWeight:"bold"}}>Asking open-ended questions is important to build trust.</h2>
                <h2 style={{fontWeight:"normal"}}>It is important to understand how trauma can affect a victim???s disclosure and how to respond when the signs of trauma present themselves in an interview. Trauma can make victims reluctant to disclose and may affect their memory of an event, causing them to disclose their stories in a non-linear or inconsistent manner. It is important to allow for multiple interviews to help the victim fully disclose the traumatic event and to understand that there may be inconsistencies that emerge in early interviews.</h2>
                <h2>If interviewing a child victim, find your local Children???s Advocacy Center. <span class="prepareLink" onClick={this._onResourcesClick}>Click here for a list of victim services.</span></h2>
              </div>
            )} />
          )} />

          <QuestionBox title={<h1>Tip 7: Educate yourself about trauma</h1>} html={(
            <BlueBox blueBoxContainer={blueBoxContainer} blueBox={blueBox} html={(
              <div>
                <h2 style={{fontWeight:"normal"}}>Approach the interview in a trauma-informed manner. It is important to understand how trauma can affect a victim???s disclosure and how to respond when the signs of trauma present themselves in an interview.</h2>
                <h2 style={{fontWeight:"normal"}}> Often, victims may suffer from post-traumatic stress disorder, depression, and/or other mental health conditions. For this reason, they may have difficulty telling you about key parts of their story. Trauma can make victims reluctant to disclose and may affect their memory of an event, causing them to disclose their stories in a non-linear or inconsistent manner. Facts may emerge over time, and it may be important to engage in multiple interviews or ask for the assistance of a forensic interviewer, when appropriate.</h2>
                <h2 style={{fontWeight:"normal"}}>Explore whether the victim has mental health supports in place at the outset and if not, make appropriate referrals to ensure the victim has support throughout the process. <span class="prepareLink" onClick={this._onResourcesClick}>Click here for a list of victim services.</span></h2>
                <h2 style={{fontWeight:"bold"}}>If a child (any victim under 18) is involved, mandated reporters must file a 51A report with the Massachusetts Department of Children and Families (DCF), which will report the situation to the local District Attorney???s Office. By law, DCF will work to establish a multidisciplinary team to provide comprehensive, tailored services to the child victim.</h2>
                <ul style={{"list-style-type": "disc", "padding-left": "16px", "margin": "0px", "font-size": "13px"}}>
                  <li>
                    <h2 style={{fontWeight:"normal"}}>Please consult with your local Children???s Advocacy Center to coordinate, and the multidisciplinary team will work with you to consider if an interview of the child is appropriate and if so, how best to approach the interview. Consider conducting a child forensic interview. Even in cases wherein there is no physical or sexual violence suspected, a child forensic interview still may be helpful given emotional abuse and fear.</h2>
                  </li>
                  <li>
                    <h2 style={{fontWeight:"normal"}}>Child forensic interviewers are trained to consider the unique family relationships, community support, histories of trauma, and cultural or social attitudes that may shape a child???s disclosure. Each child victim is different, due to different past experiences of violence and trauma. It is important to note that no two children will react in the same manner or provide the same level of detail and clarity.</h2>
                  </li>
                </ul>
                <h2 style={{fontWeight:"bold"}}>It is important to engage in a trauma-informed interview. If working with child victims, contact the local Children???s Advocacy Center as soon as possible.</h2>
              </div>
            )} />
          )} />

          <QuestionBox title={<h1>Tip 8: Educate yourself about the culture</h1>} html={(
            <BlueBox blueBoxContainer={blueBoxContainer} blueBox={blueBox} html={(
              <div>
                <h1 style={{fontWeight:"bold"}}>Culture can play an important role in how a victim engages in the interview process.</h1>
                <h2 style={{fontWeight:"normal"}}>If the victim is from a distinct ethnic or social group, educate yourself about the culture.</h2>
                <h2 style={{fontWeight:"normal"}}>Cultural norms may shape what or how the victim will disclose critical information. Consider connecting with social service providers with expertise serving this population.</h2>
              </div>
            )} />
          )} />

          <div class="clearfix" style={{'padding' : '30px 30px 10px 30px', 'width' : '100%'}}>
            <button class="button1" style={{'float' : 'right', 'margin' : '0'}} onClick = {this._onAssessClick}>Assess</button>
          </div>
        </div>
      </div>
    );
  }

  renderAssessmentSteps() {
    return (
    <div>
      <div class="AssessmentDisclaimer" style={this.state.disclaimer ? {display : "none"} : {display : "block"}}>
        <div class="WarningDiv">
          <img src={Warning} class="AssessmentWarning" />
          <p class="pageTitle"> Legal Disclaimer</p>
        </div>
        <p style={{"fontWeight" : "bold"}}>All materials on this website have been prepared for general information purposes only to permit you to learn more about labor trafficking. The information presented is not legal advice, is not to be acted on as such, may not be current and is subject to change without notice.</p>
        <p style={{"fontWeight" : "bold"}}>Communication of information by, in, to or through this website and your receipt or use of it</p>
        <ul>
          <li>
            <p>is not provided in the course of and does not create or constitute an attorney-client relationship</p>
          </li>
          <li>
            <p>is not intended as a solicitation</p>
          </li>
          <li>
            <p>is not intended to convey or constitute legal advice</p>
          </li>
          <li>
            <p>is not a substitute for obtaining legal advice from a qualified attorney</p>
          </li>
        </ul>
        <p>Click below to acknowledge that you have read and understand the disclaimer.</p>
        <div class="DisclaimerButton">
          <button class="button3" onClick={()=>{this.setState({disclaimer : !this.state.disclaimer});}}> I understand </button>
        </div>
      </div>
      <div style={this.state.disclaimer ? {display : "block"} : {display : "none"}}>
        <div class="App" >
          <p class="pageTitle">Assess</p>
          <p class="Head">Is this case trafficking?</p>
          <p class="HomeHead1">These questions can help determine if your case meets the definition of trafficking under Massachusetts law.</p>
        </div>
        <div class="AssesmentContent">
          <div class="App">
            <p class="regularText" style={{"fontStyle" : "italic"}}>Select a category to view its questions</p>
            <p class="regularText" style={{"fontWeight" : "bold", "textDecoration" : "underline"}}>Or click here to download the questions</p>
          </div>
          <br />
          <div>
            <button class="AssessmentButton" onClick={this.sHarmQuizFunc} >
              <AssessmentBox title={"Serious Harm"} content={"Causes or threatens to cause serious harm to any person"} />
            </button>
            <button class="AssessmentButton" onClick={this.restraintQuizFunc} >
              <AssessmentBox title={"Physical Restraint"} content={"Physically restrains or threatens to physically restrain another person"} />
            </button>
            <button class="AssessmentButton" onClick={this.abuseQuizFunc} >
              <AssessmentBox title={"Abuse of the Law"} content={"Abuses or threatens to abuse the law or legal process"} />
            </button>
            <button class="AssessmentButton" onClick={this.identitydocQuizFunc} >
              <AssessmentBox title={"Identity Documents"} content={"Knowingly destroys, conceals, removes, confiscates or possesses any actual or purported passport or other immigration document, or any other actual or purported government identification document, of another person"} />
            </button>
            <button class="AssessmentButton" onClick={this.extortionQuizFunc} >
              <AssessmentBox title={"Extortion"} content={"Engages in extortion under Massachusetts law"} />
            </button>
            <button class="AssessmentButton" onClick={this.fharmQuizFunc} >
              <AssessmentBox title={"Financial Harm"} content={"Causes or threatens to cause financial harm to any person"} />
            </button>
          </div>
        </div>
      </div>
    </div>
    );
  }

  handleResourcesClick(id){
    this.setState({
      resourcesPage: id,
    });
  }

  renderResources() {
    let blueBoxContainer = "prepareBlueBoxContainer";
    let blueBox = "prepareBlueBox";

    function menuClass(id){
      return ("lis new-lis resources-lis "+((id==this.state.resourcesPage)?"resources-lis-active":""));
    }
    menuClass = menuClass.bind(this)
    return (
      <div>
        <div className="App">
          <p class="pageTitle">Resources</p>
          <p class="Head" style={{paddingBottom : "15px"}}>Victim services</p>
        </div>
        <div class="resourcesDiv">
          <div class="menu resourcesMenu">
            <div class={menuClass(0)} onClick={()=>{this.handleResourcesClick(0)}}>Emergency</div>
            <div class={menuClass(1)} onClick={()=>{this.handleResourcesClick(1)}}>Safety</div>
            <div class={menuClass(2)} onClick={()=>{this.handleResourcesClick(2)}}>Immigration</div>
            <div class={menuClass(3)} onClick={()=>{this.handleResourcesClick(3)}}>Legal</div>
          </div>
        </div>
        <div class="resourcesContent">
          {(()=>{
            if(this.state.resourcesPage==0)
              return (
                <div name="Emergency" style={{display: (this.state.resourcesPage==0)?"block":"none"}}>
                  <NormalText html={(
                    <div>
                      <h1>Emergency Victim Services</h1>
                    </div>
                  )} />
                  <BlueBox html={(
                    <div>
                      <h1 style={{fontWeight:"bold"}}>National Human Trafficking Resource Center</h1>
                      <h2><span style={{fontWeight:"normal"}}>Call the Fair Labor Hotline at: <span style={{textDecoration : "underline"}}>1-888-373-7888</span></span></h2>
                      <h2><span style={{fontWeight:"normal"}}>Text "BEFREE" to: <span style={{textDecoration : "underline"}}>233733</span></span></h2>
                      <h2><span style={{fontWeight:"normal", textDecoration: "underline", color : "#11416D"}}><a href="https://humantraffickinghotline.org/chat">Click here to access live chat</a></span></h2>
                      <h2><span style={{fontWeight:"normal", textDecoration: "underline", color : "#11416D"}}><a href="mailto:help@humantraffickinghotline.org%20?subject=MA%20Labor%20Trafficking%20Case">Click here to email the hotline</a></span></h2>
                      <h2 style={{fontWeight:"normal"}}>The hotline is open 24 hours a day, 7 days a week and has resources available in more than 200 languages.</h2>
                      <h2 style={{fontWeight:"normal"}}>For resources available in your geographic area to assist labor trafficking victims, please contact the National Human Trafficking Resource Center (NHTRC) Hotline. NHTRC connects victims and survivors of human trafficking with support and services.</h2>
                    </div>
                  )} />
                  <BlueBox html={(
                    <div>
                      <h1 style={{fontWeight:"bold"}}>Emergency Shelter</h1>
                      <h2 style={{fontWeight:"normal"}}>Contact the National Human Trafficking Resource Center Hotline at <span style={{fontWeight:"bold"}}>1-888-373-788</span> for emergency shelter options.</h2>
                      <h2 style={{fontWeight:"normal"}}>Trafficking-specific Shelter Options. Listed below are organizations that place priority on housing for survivors of human trafficking:</h2>
                      <ul>
                        <li>
                          <h2 style={{fontWeight:"normal"}}> Amirah (North Shore, sex trafficking): <span style={{fontWeight:"bold"}}>(781) 462-1758</span></h2>
                        </li>
                        <li>
                          <h2 style={{fontWeight:"normal"}}> Bhakita House (Greater Boston, labor and sex trafficking): <span style={{fontWeight:"bold"}}>(781) 321-0499</span></h2>
                        </li>
                        <li>
                          <h2 style={{fontWeight:"normal"}}> EVA Center (Sex trafficking, Greater Boston): <span style={{fontWeight:"bold"}}>(617) 799-2133</span></h2>
                        </li>
                        <li>
                          <h2 style={{fontWeight:"normal"}}> RIA House (Sex trafficking, Central Massachusetts): <span style={{fontWeight:"bold"}}>info@riahouse.org </span></h2>
                        </li>
                      </ul>
                      <h2 style={{fontWeight:"normal"}}><span style={{fontWeight:"bold"}}>Domestic Violence Shelter:</span> Some domestic violence shelters may house victims of labor trafficking. Click <a href="https://www.mass.gov/service-details/domestic-violence-programs">here</a> for a complete list of shelters in Massachusetts. To determine if a shelter space is available, victims can contact the Safelink state-wide hotline at <span style={{fontWeight : "bold"}}>877-785-2020</span> (toll-free), <span style={{fontWeight : "bold"}}>877-521-2601</span> (TTY).</h2>
                    </div>
                  )} />
                  <BlueBox html={(
                    <div>
                      <h1 style={{fontWeight:"bold"}}>Food</h1>
                      <h2 style={{fontWeight:"normal"}}>Please click <a href="https://www.foodpantries.org/st/massachusetts">here</a> for information about food pantries in Massachusetts.</h2>
                    </div>
                  )} />
                </div>
              );
          })()}
          {(()=>{
            if(this.state.resourcesPage==1)
              return (
                <div name="Safety" style={{display: (this.state.resourcesPage==1)?"block":"none"}}>
                  <NormalText html={(
                    <div>
                      <h1>Safety planning is essential.</h1>
                      <h2 style={{fontWeight:"normal"}}>It is important to engage in trauma-informed safety planning with the victim to ensure that the victim is safe throughout the investigation. At the earliest stage possible, it is recommended that investigators get a victim advocate involved and make appropriate referrals to victim services agencies that can assist with safety planning.</h2>
                      <h2 style={{fontWeight:"normal"}}>In addition, it may be appropriate to ask additional questions to determine the level of risk. This may involve asking any of the following questions:</h2>
                    </div>
                  )} />
                  <YellowBox html={(
                    <div>
                      <h2 style={{color: "#11416D"}}>Are you safe?</h2>
                      <h2 style={{color: "#11416D"}}>What are you afraid will happen?</h2>
                      <h2 style={{color: "#11416D"}}>Have you ever been threatened?</h2>
                      <h2 style={{color: "#11416D"}}>Do you owe a debt to anyone?</h2>
                      <h2 style={{color: "#11416D"}}>Are you afraid of deportation?</h2>
                      <h2 style={{color: "#11416D"}}>What do you think would happen if the subject knew that you had spoken with us?</h2>
                      <h2 style={{color: "#11416D"}}>Do you feel like you need to work? If so, why?</h2>
                      <h2 style={{color: "#11416D"}}>What would happen if you did not work?</h2>
                    </div>
                  )} />
                  <NormalText html={(
                    <div>
                      <h2 style={{fontWeight:"normal"}}>Victims should play a primary role in safety planning, and safety plans must take into consideration the victim???s unique circumstances, past trauma history, mental health needs, potential need to generate income, and educational needs. Plans must be made on a case-by-case basis tailored to the victim???s needs. In particular, many victims are exploited because they need to generate income to assist their family. It is essential for investigators to address the victim???s concerns about financially supporting family members. Otherwise, the victim may remain at risk to future victimization.</h2>
                    </div>
                  )} />
                </div>
              );
          })()}
          {(()=>{
            if(this.state.resourcesPage==2)
              return (
                <div name="Immigration" style={{display: (this.state.resourcesPage==2)?"block":"none"}}>
                  <NormalText html={(
                    <div>
                      <h1>Immigration Needs for Victims</h1>
                      <h2 style={{fontWeight:"normal"}}>In cases involving noncitizen victims, refer the victim immediately to an experienced immigration attorney to screen for immigration relief and any time-sensitive deadlines. Immigrant victims may be eligible for special forms of immigration relief, such as a T or U visa, based on their status as a victim of human trafficking.</h2>
                    </div>
                  )} />
                  <NormalText html={(
                    <div>
                      <h1>Immigration Protection for Immigrant Victims of Human Trafficking</h1>
                      <h2 style={{fontWeight:"normal"}}>Undocumented victims are especially vulnerable to human trafficking. Certain immigration options are available to victims that may allow them to apply for work authorization and permission to remain in the United States. It is essential that victims consult with an experienced immigration attorney about available options and understand the risks of pursuing immigration relief. Below is a list of potential immigration remedies commonly available to victims of crime. This list is not exhaustive, and it is important that every victim be screened individually by an experienced immigration attorney for eligibility.???</h2>
                    </div>
                  )} />
                  <QuestionBox title={<h1>T Nonimmigrant Status (???T visa???)</h1>} html={(
                    <BlueBox blueBoxContainer={blueBoxContainer} blueBox={blueBox} html={(
                      <div>
                        <h2 style={{fontWeight:"bold"}}>What is T nonimmigrant status?</h2>
                        <h2 style={{fontWeight:"normal"}}>T nonimmigrant status is a form of immigration status for victims of severe forms of trafficking in persons under federal law. T nonimmigrant status provides the victim with immigration status for four years, ability to work legally, and eligibility to apply for certain derivative family members and permanent residency. In addition, victims may be able to access public benefits, including refugee cash assistance and food stamps. Please note that victims are not eligible for employment authorization until the application is approved.</h2>
                        <h2 style={{fontWeight:"bold"}}>Who is eligible?</h2>
                        <h2 style={{fontWeight:"normal"}}>This benefit is only available to victims who meet the federal definition of a victim of a severe form of human trafficking, which is defined as:</h2>
                        <ul>
                          <li>
                            <h2 style={{fontWeight:"normal"}}>Sex trafficking in which a commercial sex act is induced by force, fraud, or coercion, or in which the person induced to perform such act has not attained 18 years of age.</h2>
                          </li>
                          <li>
                            <h2 style={{fontWeight:"normal"}}>Labor or services, through the use of force, fraud, or coercion for the purpose of subjection to involuntary servitude, peonage, debt bondage, or slavery.</h2>
                          </li>
                        </ul>
                        <h2 style={{fontWeight:"normal"}}>The victim must also show that he or she:</h2>
                        <ul>
                          <li>
                            <h2 style={{fontWeight:"normal"}}>Is a victim of a severe form of human trafficking.</h2>
                          </li>
                          <li>
                            <h2 style={{fontWeight:"normal"}}>Is physically present in the United States on account of trafficking.</h2>
                          </li>
                          <li>
                            <h2 style={{fontWeight:"normal"}}>Has complied with any reasonable request by federal, state, or local law enforcement agency to assist in the investigation or prosecution of such trafficking (unless unable to cooperate due to psychological trauma or the victim is under 18 years old).</h2>
                          </li>
                          <li>
                            <h2 style={{fontWeight:"normal"}}>Would suffer extreme hardship involving unusual and severe harm upon removal (i.e., deportation).</h2>
                          </li>
                        </ul>
                        <h2 style={{fontWeight:"bold"}}>What is T visa certification?</h2>
                        <h2 style={{fontWeight:"normal"}}>To apply for T nonimmigrant status, U.S. Citizenship and Immigration Services asks for the victim to submit a certification form from a qualifying government agency confirming that the applicant was a victim of a severe form of human trafficking and responded to a reasonable request for assistance from law enforcement. The certification form is known as Form I-914, Supplement B, Declaration of Law Enforcement Officer for Victim of Trafficking in Persons.</h2>
                        <h2 style={{fontWeight:"bold"}}>What is the role of the investigator?</h2>
                        <h2 style={{fontWeight:"normal"}}>Investigators can play an important role by completing the certification form (Form I-914, Supplement B) to confirm the status of the victim and his or her role in the investigation. This certification does not provide immigration status but assists the victim to prove to U.S. Citizenship and Immigration Services that he or she meets the requirements to qualify for T nonimmigrant status.</h2>
                        <h2 style={{fontWeight:"bold"}}>Who can complete the T visa certification?</h2>
                        <h2 style={{fontWeight:"normal"}}>The certification form (Form I-914, Supplement B) can be completed by any government agency that has responsibility for the detection, investigation, and/or prosecution of severe forms of human trafficking in Persons. </h2>
                      </div>
                    )} />
                  )} />
                  <QuestionBox title={<h1>U Nonimmigrant Status (???U visa???)</h1>} html={(
                    <BlueBox blueBoxContainer={blueBoxContainer} blueBox={blueBox} html={(
                      <div>
                        <h2 style={{fontWeight:"bold"}}>What is U nonimmigrant status?</h2>
                        <h2 style={{fontWeight:"normal"}}>U nonimmigrant status is a form of immigration status for victims of violent crime, including victims of human trafficking under state or federal law. U nonimmigrant status provides the victim with immigration status for four years and eligibility to apply for certain derivative family members and eventual permanent residency. Please note that victims are not eligible for employment authorization until the application is approved, and current processing times are very long.</h2>
                        <h2 style={{fontWeight:"bold"}}>Who is eligible?</h2>
                        <h2 style={{fontWeight:"normal"}}>A victim may be eligible for U nonimmigrant status if he or she:</h2>
                        <ul>
                          <li>
                            <h2 style={{fontWeight:"normal"}}>Has suffered substantial physical or mental abuse as a result of having been a victim of a qualifying crime, including human trafficking, involuntary servitude, peonage, and slave trade, or substantially similar criminal activity.</h2>
                          </li>
                          <li>
                            <h2 style={{fontWeight:"normal"}}>Possesses information about the criminal activit.</h2>
                          </li>
                          <li>
                            <h2 style={{fontWeight:"normal"}}>Has been helpful, is being helpful, or is likely to be helpful to a Federal, State, or local law enforcement official, to a Federal, State, or local prosecutor, to a Federal or State judge, to United States Citizenship and Immigration Services, or to other Federal, State, or local authorities investigating or prosecuting the criminal activity</h2>
                          </li>
                          <li>
                            <h2 style={{fontWeight:"normal"}}>The criminal activity violated the laws of the United States or occurred in the United States (including in Indian country and military institutions) or the territories and possessions of the United States.</h2>
                          </li>
                        </ul>
                        <h2 style={{fontWeight:"bold"}}>What is U visa certification?</h2>
                        <h2 style={{fontWeight:"normal"}}>To qualify, a victim must obtain a U Nonimmigrant Status Certification (Form I-918, Supplement B) from a qualifying government agency, confirming that he or she was a victim and was, is, or will be helpful in the investigation.</h2>
                        <h2 style={{fontWeight:"bold"}}>What is the role of the investigator?</h2>
                        <h2 style={{fontWeight:"normal"}}>nvestigators can play an important role to assist the victim to obtain immigration status by completing a U visa certification (Form I-918, Supplement B), confirming the status of the victim and his or her role in the investigation. Such a certification does not provide immigration status but assists the victim to prove to U.S. Citizenship and Immigration Services that he or she meets the requirements to qualify for immigration status.</h2>
                        <h2 style={{fontWeight:"bold"}}>Who can complete the U visa certification?</h2>
                        <h2 style={{fontWeight:"normal"}}>The certification form (Form I-918, Supplement B) can be completed by any government agency that has responsibility for the detection, investigation, or prosecution of a qualifying crime or criminal activity.</h2>
                      </div>
                    )} />
                  )} />
                  <QuestionBox title={<h1>Continued Presence</h1>} html={(
                    <BlueBox blueBoxContainer={blueBoxContainer} blueBox={blueBox} html={(
                      <div>
                        <h2 style={{fontWeight:"bold"}}>What is Continued Presence?</h2>
                        <h2 style={{fontWeight:"normal"}}>Continued Presence is a short-term form of immigration relief provided to individuals identified as victims of human trafficking in a potential criminal investigation. The application for Continued Presence must be submitted by federal law enforcement. However, local and state investigators can play an important role by coordinating with a federal law enforcement agency to submit an application. This is generally the fastest way to ensure that the victim has access to employment authorization and access to important government benefits. This benefit provides access to work authorization for two years, and it is renewable subject to law enforcement approval. The victim also may qualify for certain public benefits.</h2>
                        <h2 style={{fontWeight:"bold"}}>What is the role of the investigator?</h2>
                        <h2 style={{fontWeight:"normal"}}>To assist a victim to apply for Continued Presence, contact a federal law enforcement agency with the authority to submit an application.</h2>
                      </div>
                    )} />
                  )} />
                  <QuestionBox title={<h1>Other Options to Consider</h1>} html={(
                    <BlueBox blueBoxContainer={blueBoxContainer} blueBox={blueBox} html={(
                      <div>
                        <h2 style={{fontWeight:"normal"}}>There are various other immigration options for which victims may qualify, including asylum, relief under the Violence Against Women Act, and Special Immigrant Juvenile Status, among others. For this reason, it is strongly recommended that a victim consult with an experienced immigration attorney as early as possible in the process.</h2>
                      </div>
                    )} />
                  )} />
                  <NormalText html={(
                    <div>
                      <h2 style={{fontWeight:"bold"}}>These organizations provide specialized legal services to trafficking survivors:</h2>
                    </div>
                  )} />
                  <BlueBox html={(
                    <div>
                      <h2 style={{fontWeight:"normal"}}>Worcester, MA</h2>
                      <h1 style={{fontWeight:"bold"}}>Ascentria Care Alliance</h1>
                      <h2 style={{fontWeight:"normal"}}>Tel.: <span style={{textDecoration : "underline"}}>(774) 243-3041</span></h2>
                      <h2 style={{fontWeight:"normal"}}>Emergency Cell: <span style={{textDecoration : "underline"}}>(774) 437-3237</span></h2>
                      <h2 style={{fontWeight:"bold"}}>Geographic Limitations:</h2>
                      <h2 style={{fontWeight:"normal"}}>Can accept cases involving Central Massachusetts residents under 187.5% of the poverty guidelines.</h2>
                    </div>
                  )} />
                  <BlueBox html={(
                    <div>
                      <h2 style={{fontWeight:"normal"}}>Boston, MA</h2>
                      <h1 style={{fontWeight:"bold"}}>Boston University School of Law Immigrants??? Rights and Human Trafficking Program</h1>
                      <h2 style={{fontWeight:"normal"}}>Tel.: <span style={{textDecoration : "underline"}}>(617) 353-2807</span></h2>
                      <h2 style={{fontWeight:"normal"}}>Email: <span style={{textDecoration : "underline"}}>Jadahl@bu.edu</span></h2>
                      <h2 style={{fontWeight:"bold"}}>Geographic Limitations:</h2>
                      <h2 style={{fontWeight:"normal"}}>Can accept cases involving Massachusetts residents under 187.5% of the poverty guidelines.</h2>
                    </div>
                  )} />
                  <NormalText html={(
                    <div>
                      <h2 style={{fontWeight:"bold"}}>The following organizations provide general immigration legal services to income-eligible Massachusetts residents:</h2>
                    </div>
                  )} />
                  <BlueBox html={(
                    <div>
                      <h2 style={{fontWeight:"normal"}}>275 West Broadway, South Boston, MA 02127</h2>
                      <h1 style={{fontWeight:"bold"}}>Catholic Charities Refugee and Immigration Services</h1>
                      <h2 style={{fontWeight:"normal"}}>Tel.: <span style={{textDecoration : "underline"}}>(617) 464-8100</span></h2>
                      <h2 style={{fontWeight:"normal"}}>Fax: <span style={{textDecoration : "underline"}}>(617) 464-8150</span></h2>
                      <ul>
                        <li>
                          <h2 style={{fontWeight:"normal"}}>Legal Clinic for advice, referral and forms assistance.</h2>
                        </li>
                        <li>
                          <h2 style={{fontWeight:"normal"}}>Family reunification visas.</h2>
                        </li>
                        <li>
                          <h2 style={{fontWeight:"normal"}}>Immigrant victims of domestic violence and U Visas.</h2>
                        </li>
                        <li>
                          <h2 style={{fontWeight:"normal"}}>Special Immigrant Juveniles.</h2>
                        </li>
                        <li>
                          <h2 style={{fontWeight:"normal"}}>Immigrant victims of human trafficking.</h2>
                        </li>
                        <li>
                          <h2 style={{fontWeight:"normal"}}>Nominal fees charged for representation.</h2>
                        </li>
                        <li>
                          <h2 style={{fontWeight:"normal"}}>Representation dependent upon income.</h2>
                        </li>
                      </ul>
                    </div>
                  )} />
                  <BlueBox html={(
                    <div>
                      <h2 style={{fontWeight:"normal"}}>405 Main Street, 4th Floor, Worcester, MA 01608</h2>
                      <h1 style={{fontWeight:"bold"}}>Centralwest Justice Center</h1>
                      <h2 style={{fontWeight:"normal"}}>Tel.: <span style={{textDecoration : "underline"}}>(508) 752-3718</span></h2>
                      <h2 style={{fontWeight:"normal"}}>Fax: <span style={{textDecoration : "underline"}}>(508) 752-5918</span></h2>
                      <br />
                      <h2 style={{fontWeight:"normal"}}>One Monarch Place, Springfield, MA 01144</h2>
                      <h2 style={{fontWeight:"normal"}}>Tel.: <span style={{textDecoration : "underline"}}>(413) 781-7814</span></h2>
                      <h2 style={{fontWeight:"normal"}}>Fax: <span style={{textDecoration : "underline"}}>(413) 746-3221</span></h2>
                      <ul>
                        <li>
                          <h2 style={{fontWeight:"normal"}}>Free representation to noncitizens seeking humanitarian immigration relief, including asylum, relief under the Violence Against Women Act, Special Immigrant Juvenile Status, U visas for crime victims, and T visas for trafficking victims.</h2>
                        </li>
                        <li>
                          <h2 style={{fontWeight:"normal"}}>Services available only to low-income residents of Central and Western Massachusetts (Berkshire, Franklin, Hampden, Hampshire, and Worcester Counties).</h2>
                        </li>
                      </ul>
                    </div>
                  )} />
                  <BlueBox html={(
                    <div>
                      <h2 style={{fontWeight:"normal"}}>98 North Washington Street, Suite 106, Boston, MA 02114</h2>
                      <h1 style={{fontWeight:"bold"}}>Political Asylum/Immigration Representation Project (PAIR)</h1>
                      <h2 style={{fontWeight:"normal"}}>Tel.: <span style={{textDecoration : "underline"}}>(617) 742-9296</span></h2>
                      <h2 style={{fontWeight:"normal"}}>Fax: <span style={{textDecoration : "underline"}}>(617) 742-9385</span></h2>
                      <ul>
                        <li>
                          <h2 style={{fontWeight:"normal"}}>Represents asylum applicants.</h2>
                        </li>
                        <li>
                          <h2 style={{fontWeight:"normal"}}>Represents detained persons on a limited basis.</h2>
                        </li>
                        <li>
                          <h2 style={{fontWeight:"normal"}}>Conducts Know Your Rights presentation for persons detained in the Suffolk County House of Corrections, the Bristol County Jail & House of Corrections, and Plymouth County Correctional Facility.</h2>
                        </li>
                        <li>
                          <h2 style={{fontWeight:"normal"}}>Conducts phone intake for detainees and families of detainees from 1-3 pm, M-Th. Clients must meet low-income guidelines for representation.</h2>
                        </li>
                      </ul>
                    </div>
                  )} />
                  <BlueBox html={(
                    <div>
                      <h2 style={{fontWeight:"normal"}}>47 Thorndike Street Suite SB-LL-1 Cambridge, MA 02141</h2>
                      <h1 style={{fontWeight:"bold"}}>Community Legal Services Counseling Center</h1>
                      <h2 style={{fontWeight:"normal"}}>Tel.: <span style={{textDecoration : "underline"}}>(617) 661-1010</span></h2>
                      <h2 style={{fontWeight:"normal"}}>Fax: <span style={{textDecoration : "underline"}}>(617) 661-1011</span></h2>
                      <ul>
                        <li>
                          <h2 style={{fontWeight:"normal"}}>Represents noncitizens in asylum proceedings and victims of domestic violence seeking lawful permanent residence.</h2>
                        </li>
                      </ul>
                    </div>
                  )} />
                  <BlueBox html={(
                    <div>
                      <h2 style={{fontWeight:"normal"}}>Boston Office c/o Nutter McClennen & Fish LLP Seaport West, 155 Seaport Blvd, 5th Floor Boston, MA 02210</h2>
                      <h1 style={{fontWeight:"bold"}}>Kids in Need of Defense (KIND)</h1>
                      <h2 style={{fontWeight:"normal"}}>Tel.: <span style={{textDecoration : "underline"}}>(617) 207-4138</span></h2>
                      <ul>
                        <li>
                          <h2 style={{fontWeight:"normal"}}>Serves victims under age 18 only</h2>
                        </li>
                      </ul>
                    </div>
                  )} />
                  <BlueBox html={(
                    <div>
                      <h2 style={{fontWeight:"normal"}}>197 Friend Street Boston, MA 02114</h2>
                      <h1 style={{fontWeight:"bold"}}>Greater Boston Legal Services</h1>
                      <h2 style={{fontWeight:"normal"}}>Tel.: <span style={{textDecoration : "underline"}}>(617) 371-1234</span></h2>
                      <ul>
                        <li>
                          <h2 style={{fontWeight:"normal"}}>Represents noncitizens in Asylum proceedings.</h2>
                        </li>
                        <li>
                          <h2 style={{fontWeight:"normal"}}>Representation dependent upon noncitizens meeting income guidelines.</h2>
                        </li>
                        <li>
                          <h2 style={{fontWeight:"normal"}}>Walk in services 9:30 am - 3 pm (Mon. - Thurs).</h2>
                        </li>
                      </ul>
                    </div>
                  )} />
                  <BlueBox html={(
                    <div>
                      <h2 style={{fontWeight:"normal"}}>333 Faunce Corner Road North Dartmouth, MA 02747</h2>
                      <h1 style={{fontWeight:"bold"}}>University of Massachusetts School of Law Dartmouth Immigration Law Clinic</h1>
                      <h2 style={{fontWeight:"normal"}}>Tel.: <span style={{textDecoration : "underline"}}>(508) 985-1174</span></h2>
                      <h2 style={{fontWeight:"normal"}}>Fax: <span style={{textDecoration : "underline"}}>(508) 985-1136</span></h2>
                      <ul>
                        <li>
                          <h2 style={{fontWeight:"normal"}}>Eligibility is based on income. Interpreters provided upon request. Inquiries are accepted by telephone or mail.</h2>
                        </li>
                        <li>
                          <h2 style={{fontWeight:"normal"}}>Limited representation is available during May to August.</h2>
                        </li>
                      </ul>
                    </div>
                  )} />
                </div>
              );
          })()}
          {(()=>{
            if(this.state.resourcesPage==3)
              return (
                <div name="Legal" style={{display: (this.state.resourcesPage==3)?"block":"none"}}>
                  <NormalText html={(
                    <div>
                      <h1>Victim Rights Legal Services</h1>
                      <h2 style={{fontWeight:"normal"}}>The following organizations provide specialized legal services to victims:</h2>
                    </div>
                  )} />
                  <BlueBox html={(
                    <div>
                      <h1 style={{fontWeight:"normal"}}>Boston, MA</h1>
                      <h1><a href="https://www.bu.edu/law/current-students/jd-student-resources/experiential-learning/clinics/immigrants-rights-human-trafficking-clinic/" style={{fontWeight:"bold", color:"#11416D", textDecoration:"underline"}}>Boston University School of Law Immigrants??? Rights and Human Trafficking Program</a></h1>
                      <h2>Tel.: <span style={{"textDecoration" : "underline"}}>(617) 353-2807</span></h2>
                      <h2>Email: <span style={{"textDecoration" : "underline"}}>Jadahl@bu.edu</span></h2>
                    </div>
                  )} />
                  <BlueBox html={(
                    <div>
                      <h1 style={{fontWeight:"normal"}}>State-wide</h1>
                      <h1><a href="https://massclavc.org/" style={{fontWeight:"bold", color:"#11416D", textDecoration:"underline"}}>Civil Legal Aid for Victims of Crime Attorneys</a></h1>
                      <h2>Tel.: <span style={{"textDecoration" : "underline"}}>(617) 367-8544</span></h2>
                    </div>
                  )} />
                  <BlueBox html={(
                    <div>
                      <h1 style={{fontWeight:"normal"}}>Boston, MA</h1>
                      <h1><a href="https://www.victimrights.org/" style={{fontWeight:"bold", color:"#11416D", textDecoration:"underline"}}>Victim Rights Law Center</a></h1>
                      <h2>Tel.: <span style={{"textDecoration" : "underline"}}>(617) 399-6720</span></h2>
                      <h2 style={{fontWeight:"normal"}}>Limitations: Can only accept cases involving victims of sexual assault.</h2>
                    </div>
                  )} />
                  <NormalText html={(
                    <div>
                      <h2>Victim Compensation:</h2>
                      <h2 style={{fontWeight:"normal"}}>Victims of labor trafficking may also be eligible for victim compensation. To apply for compensation, the victim should complete the application <a href="https://www.mass.gov/files/documents/2018/11/13/victim-comp-app.pdf" style={{fontWeight:"bold", color:"#11416D" , textDecoration:"underline"}}>here</a> or contact the <a href="https://www.mass.gov/massachusetts-victims-of-violent-crime-compensation" style={{fontWeight:"bold", color:"#11416D", textDecoration:"underline"}}>Massachusetts Office of Victim Assistance</a> at 844-878-MOVA (6682).</h2>
                    </div>
                  )} />
                </div>
              );
          })()}
        </div>
      </div>
    );
  }

  renderMassStatute(){
    return (
      <div>
        <div style={{borderBottom : "1px solid #EAEAEA"}} className="App">
          <p class="pageTitle">Mass Statute</p>
          <p class="Head" style={{paddingBottom: "15px"}}>Massachusetts Law</p>
        </div>
        <div style={{backgroundColor : "#fff", paddingTop: "20px"}}>
          <NormalText html={(
            <div>
              <h2 style={{fontWeight:"normal"}}>If you are not a law enforcement investigator, you should bring your report to law enforcement at this stage. If you are a law enforcement investigator, you should commence your investigation into the specific facts surrounding this person and his/her situation and generate your investigative report according to your agency protocol for investigations.</h2>
            </div>
          )} />
          <div class="massTitle">
            <p>Massachusetts Law</p>
          </div>
          <BlueBox blueBox={"massBlueBox"} html={
            <div>
              <h2>Crime of Trafficking in Persons for Forced Services:</h2>
              <h2 style={{fontWeight : "normal"}}>Under Massachusetts law, the crime of labor trafficking is known as Trafficking in Persons for Forced Services. This crime involves whoever knowingly:</h2>
              <ul>
                <li>
                  <h2 style={{fontWeight: "normal"}}>subjects, or attempts to subject, another person to forced services, or recruits, entices, harbors, transports, provides or obtains by any means, or attempts to recruit, entice, harbor, transport, provide or obtain by any means, another person, intending or knowing that such person will be subjected to forced services; or</h2>
                </li>
                <li>
                  <h2 style={{fontWeight: "normal"}}>benefits, financially or by receiving anything of value, as a result of a violation of the above. M.G.L. ch. 265, ?? 51.</h2>
                </li>
              </ul>
              <hr />
              <h2>Definition of Forced Services:</h2>
              <h2 style={{fontWeight : "normal"}}>If one or more of the six prongs listed below are met, the conduct is categorized as Trafficking in Persons for Forced Services. Trafficking in Persons for Forced Services is defined as services performed or provided by a person that are obtained or maintained by another person who:</h2>
              <ul>
                <li>
                  <h2 style={{fontWeight: "normal"}}>causes or threatens to cause serious harm to any person</h2>
                </li>
                <li>
                  <h2 style={{fontWeight: "normal"}}>physically restrains or threatens to physically restrain another person</h2>
                </li>
                <li>
                  <h2 style={{fontWeight: "normal"}}>abuses or threatens to abuse the law or legal process</h2>
                </li>
                <li>
                  <h2 style={{fontWeight: "normal"}}>knowingly destroys, conceals, removes, confiscates or possesses any actual or purported passport or other immigration document, or any other actual or purported government identification document, of another person</h2>
                </li>
                <li>
                  <h2 style={{fontWeight: "normal"}}>engages in extortion under Massachusetts law</h2>
                </li>
                <li>
                  <h2 style={{fontWeight: "normal"}}>causes or threatens to cause financial harm to any person. M.G.L. ch. 265, ?? 49.</h2>
                </li>
              </ul>
            </div>
          } />
          <div class="massTitle">
            <p>Overlap with Other Crimes</p>
          </div>
          <NormalText html={(
            <div>
              <h2 style={{fontWeight:"normal"}}>It is common that labor trafficking may overlap with other crimes, such as sex trafficking, sexual assault, wage theft and other crimes. An investigator should be aware that other violations of law may surface warranting further referral.</h2>
            </div>
          )} />
          <div class="massTitle">
            <p>Criminal Penalties</p>
          </div>
          <BlueBox blueBox={"massBlueBox"} html={
            <div>
              <ul>
                <li>
                  <h2 style={{fontWeight: "normal"}}>The crime of Trafficking in Persons for Forced Services shall be punished by imprisonment in the state prison for not less than 5 years but not more than 20 years and by a fine of not more than $25,000. M.G.L. ch. 265, ?? 51(a).</h2>
                </li>
                <li>
                  <h2 style={{fontWeight: "normal"}}>Whoever commits the crime of trafficking of persons for forced services upon a person under 18 years of age shall be punished by imprisonment in the state prison for life or for any term of years, but not less than 5 years. M.G.L. ch. 265, ?? 51(b). </h2>
                </li>
                <li>
                  <h2 style={{fontWeight: "normal"}}>A business entity that commits trafficking of persons for forced labor services shall be punished by a fine of not more than $1,000,000.??? M.G.L. ch. 265, 51(c).</h2>
                </li>
              </ul>
            </div>
          } />
          <div class="massTitle">
            <p>Federal Criminal Statutes</p>
          </div>
          <BlueBox blueBox={"massBlueBox"} html={
            <div>
              <h2 style={{fontWeight : "normal"}}>There are also federal criminal statutes that address labor trafficking crimes, such as forced labor and involuntary servitude. Victims also may have additional rights to criminal restitution, civil remedies, and government benefits under federal law. </h2>
              <h2 style={{fontWeight : "normal"}}>Click here to read more about the federal crimes of labor trafficking.</h2>
              <h2 style={{fontWeight : "normal"}}>Violations under federal law must be referred to federal authorities.</h2>
              <h2 style={{fontWeight : "normal"}}>Click here for a list of the federal human trafficking crimes.</h2>
              <h2 style={{fontWeight : "normal"}}>To report to federal law enforcement, please contact the National Human Trafficking Resource Center Hotline at <span style={{textDecoration : "underline", fontWeight : "bold"}}>1-888-373-788</span>, which will send the information to federal law enforcement within a given jurisdiction.</h2>
            </div>
          } />
        </div>
      </div>
    )
  }

  renderReport(){
    return (
      <div>
        <div style={{borderBottom : "1px solid #EAEAEA"}} className="App">
          <p class="pageTitle">Resources</p>
          <p class="Head" style={{paddingBottom: "15px"}}>Report</p>
        </div>
        <div style={{backgroundColor : "#fff", paddingTop: "20px"}}>
          <NormalText html={(
            <div>
              <h2 style={{fontWeight:"bold"}}>If this is an emergency, call 9-11.</h2>
              <h2 style={{fontWeight:"bold"}}>For non-emergencies, please contact the following offices to report suspected labor trafficking:</h2>
            </div>
          )} />
          <BlueBox html={
            <div>
              <h2>Massachusetts Attorney General???s Office</h2>
              <h2 style={{fontWeight:"normal"}}>Call the Fair Labor Hotline at <span style={{textDecoration:"underline"}}>(617) 727-3465</span></h2>
              <h2 style={{fontWeight:"normal"}}>Available Monday???Friday 10:00AM???4:00PM</h2>
            </div>
          } />
          <BlueBox html={(
            <div>
              <h1 style={{fontWeight:"bold"}}>National Human Trafficking Resource Center</h1>
              <h2><span style={{fontWeight:"normal"}}>Call the Fair Labor Hotline at: <span style={{textDecoration : "underline"}}>1-888-373-7888</span></span></h2>
              <h2><span style={{fontWeight:"normal"}}>Text "BEFREE" to: <span style={{textDecoration : "underline"}}>233733</span></span></h2>
              <h2><span style={{fontWeight:"normal", textDecoration: "underline", color : "#11416D"}}><a href="https://humantraffickinghotline.org/chat">Click here to access live chat</a></span></h2>
              <h2><span style={{fontWeight:"normal", textDecoration: "underline", color : "#11416D"}}><a href="mailto:help@humantraffickinghotline.org%20?subject=MA%20Labor%20Trafficking%20Case">Click here to email the hotline</a></span></h2>
            </div>
          )} />
          <div style={{textAlign: "right", padding : "10px 30px"}}>
            <button class="button3" style={{float : "unset"}} onClick={this._onResourcesClick}>Victim Services</button>
          </div>
        </div>

      </div>
    )
  }

  renderNavHome() {
    return (
      <div class="row menu">
        <div class="col-md-2 col-lg-2 lis new-lis"><a class="active" onClick= {this._onCompleteClick}>HOME</a></div>
        <div class="col-md-2 col-lg-2 lis new-lis"><a onClick= {this._onPrepareClick}>PREPARE</a></div>
        <div class="col-md-2 col-lg-2 lis new-lis"><a onClick= {this._onAssessClick}>ASSESS</a></div>
        <div class="col-md-2 col-lg-2 lis new-lis"><a onClick= {this._onInvestigateClick}>INVESTIGATE</a></div>
        <div class="col-md-2 col-lg-2 lis new-lis"><a onClick= {this._onVictimClick}>VICTIM SERVICES</a></div>
      </div>
    );
  }

  renderNavPrepare() {
    return (
      <div class="row menu">
        <div class="col-md-2 col-lg-2 lis new-lis"><a onClick= {this._onCompleteClick}>HOME</a></div>
        <div class="col-md-2 col-lg-2 lis new-lis"><a class="active" onClick= {this._onPrepareClick}>PREPARE</a></div>
        <div class="col-md-2 col-lg-2 lis new-lis"><a onClick= {this._onAssessClick}>ASSESS</a></div>
        <div class="col-md-2 col-lg-2 lis new-lis"><a onClick= {this._onInvestigateClick}>INVESTIGATE</a></div>
        <div class="col-md-2 col-lg-2 lis new-lis"><a onClick= {this._onVictimClick}>VICTIM SERVICES</a></div>
      </div>
    );
  }

  renderNavAsses() {
    return (
      <div class="row menu">
        <div class="col-md-2 col-lg-2 lis new-lis"><a onClick= {this._onCompleteClick}>HOME</a></div>
        <div class="col-md-2 col-lg-2 lis new-lis"><a onClick= {this._onPrepareClick}>PREPARE</a></div>
        <div class="col-md-2 col-lg-2 lis new-lis"><a class="active" onClick= {this._onAssessClick}>ASSESS</a></div>
        <div class="col-md-2 col-lg-2 lis new-lis"><a onClick= {this._onInvestigateClick}>INVESTIGATE</a></div>
        <div class="col-md-2 col-lg-2 lis new-lis"><a onClick= {this._onVictimClick}>VICTIM SERVICES</a></div>
      </div>
    );
  }

  renderNavInvestigate() {
    return (
      <div class="row menu">
        <div class="col-md-2 col-lg-2 lis new-lis"><a onClick= {this._onCompleteClick}>HOME</a></div>
        <div class="col-md-2 col-lg-2 lis new-lis"><a onClick= {this._onPrepareClick}>PREPARE</a></div>
        <div class="col-md-2 col-lg-2 lis new-lis"><a onClick= {this._onAssessClick}>ASSESS</a></div>
        <div class="col-md-2 col-lg-2 lis new-lis"><a class="active" onClick= {this._onInvestigateClick}>INVESTIGATE</a></div>
        <div class="col-md-2 col-lg-2 lis new-lis"><a onClick= {this._onVictimClick}>VICTIM SERVICES</a></div>
      </div>
    );
  }

  renderNavVictim() {
    return (
      <div class="row menu">
        <div class="col-md-2 col-lg-2 lis new-lis"><a onClick= {this._onCompleteClick}>HOME</a></div>
        <div class="col-md-2 col-lg-2 lis new-lis"><a onClick= {this._onPrepareClick}>PREPARE</a></div>
        <div class="col-md-2 col-lg-2 lis new-lis"><a onClick= {this._onAssessClick}>ASSESS</a></div>
        <div class="col-md-2 col-lg-2 lis new-lis"><a onClick= {this._onInvestigateClick}>INVESTIGATE</a></div>
        <div class="col-md-2 col-lg-2 lis new-lis"><a class="active" onClick= {this._onVictimClick}>VICTIM SERVICES</a></div>
      </div>
    );
  }

  renderMobileMenu() {
    return (
      <div class="mobile-menu">
        <div class="mobile-cover" style={this.state.mobileMenu ? {right: '70vw'} : {right: '0'}}></div>
        <div class="lis new-lis"><a class={this.state.page == 1? ("active") : ("")} onClick= {this._onCompleteClick}>Home</a></div>
        <div class="lis new-lis"><a class={this.state.page == 2? ("active") : ("")} onClick= {this._onPrepareClick}>Prepare</a></div>
        <div class="lis new-lis"><a class={this.state.page == 3 || this.state.page == 5? ("active") : ("")} onClick= {this._onAssessClick}>Assess</a></div>
        <div style={{pointerEvents:"none"}} class="lis new-lis"><a style={{pointerEvents:"none"}} class={this.state.page == 6 || this.state.page == 8? ("active") : ("")}>Resources</a></div>
        <ul class="resources-ul">
          <li onClick={this._onReportClick}>
            <p style={this.state.page == 8?{textDecoration : "underline"}:{}}>Report</p>
          </li>
          <li onClick= {this._onResourcesClick}>
            <p style={this.state.page == 6?{textDecoration : "underline"}:{}}>Victim Services</p>
          </li>
        </ul>
        <div class="lis new-lis"><a class={this.state.page == 7? ("active") : ("")} onClick= {this._onMassClick}>MA Law</a></div>
      </div>
    );
  }

  handleMenuClick() {
  this.setState({
    mobileMenu : !this.state.mobileMenu,
  })
}

  render() {
    if(this.state.qcategory_old != this.state.qcategory || this.state.page_old != this.state.page){
      this.setState({qcategory_old : this.state.qcategory, page_old : this.state.page});
      this.scrollToTop();
    }
    return (
      <div>
        <div className="Assess" ref="main" style={this.state.mobileMenu ? ({left : '-70vw'}) : ({left: '0'})}>

          <div class="topRowContainer row">
          <div class="topRow col-xs-6 col-sm-6 col-md-3 col-lg-3">
          <img src={logo} className="topDivHL" alt="logo" />
          <h3 class ="topDivH"><a href="https://www.mass.gov/" style={{color : "inherit"}}>MA AGO</a></h3>
          </div>

          <div class="topRow1 col-xs-6 col-sm-6 col-md-9 col-lg-9">
          <img src={menu} class="show-menu" onClick={()=>{this.handleMenuClick()}}/>
          <input type="checkbox" id="show-menu" role="button" />
          {/*this.state.page == 2 ? this.renderNavPrepare() : this.state.page == 3 || this.state.page == 4 ?
            this.renderNavAsses() : this.state.page == 5? this.renderNavAsses() : this.state.page == 6 ?
            this.renderNavVictim() : this.renderNavHome()*/}
          {
            (()=>{
              switch(this.state.page){
                case 2:
                  return this.renderNavPrepare();
                  break;
                case 3:
                case 4:
                case 5:
                  return this.renderNavAsses();
                  break;
                case 6:
                  return this.renderNavVictim();
                  break;
                default:
                  return this.renderNavHome();
                }
              })()
            }
          </div>
        </div>

        {/*  this.state.page == 1 ? this.renderHome() : this.state.page == 2 ? this.renderPrepare() :
            this.state.page == 3 ? this.renderAssessmentSteps() : this.state.page == 4 ? (this.state.qcategory == 1 ?
            this.renderHarmQuiz() : this.state.qcategory == 2 ? this.renderRestraintQuiz() : this.state.qcategory == 3 ?
            this.renderAbuseQuiz() : this.state.qcategory == 4 ? this.renderIdentityQuiz() : this.state.qcategory == 5 ?
            this.renderExtortionQuiz() : this.renderfHarmQuiz()): this.state.page == 5 ? this.renderResult() : this.state.page == 6 ? this.renderResources() : this.renderHome()*/}
          {(()=>{
            switch(this.state.page){
            case 2:
              return this.renderPrepare();
              break;
            case 3:
              return this.renderAssessmentSteps();
              break;
            case 4:
              switch(this.state.qcategory){
                case 1:
                  return this.renderHarmQuiz();
                  break;
                case 2:
                  return this.renderRestraintQuiz();
                  break;
                case 3:
                  return this.renderAbuseQuiz();
                  break;
                case 4:
                  return this.renderIdentityQuiz();
                  break;
                case 5:
                  return this.renderExtortionQuiz();
                  break;
                default:
                  return this.renderfHarmQuiz();
                  break;
              }
              break;
            case 5:
              let JSXlist = [this.renderAssessmentSteps(), this.renderResult()];
              return JSXlist;
              break;
            case 6:
              return this.renderResources();
              break;
            case 7:
              return this.renderMassStatute();
              break;
            case 8:
              return this.renderReport();
              break;
            default:
              return this.renderHome();
              break;
            }})()
          }
        </div>
        {this.renderMobileMenu()}
      </div>
    );
  }
}

export default App;
