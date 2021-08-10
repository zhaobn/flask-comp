
const mode = 'flask' // '', 'dev', 'test', 'flask'

/** Pick a condition */
const conds_for_exp = [ 'comp_mult', 'comp_mult_reverse', 'comp_const' ]
const cond = conds_for_exp[Math.floor(Math.random() * conds_for_exp.length)];
(mode==='dev'|mode==='test')? console.log(`${mode} mode; condition ${cond}.`) : null

const start_time = Date.now();
let start_task_time = 0;

/** Example egg in introduction */
let introEg = document.getElementById('intro-eg')
let introEgConfigs = [ "(1,0,1)", "(2,1,1)", "(3,4,1)" ]
introEg.innerHTML = introEgConfigs.map(ic => `<svg class="intro-eg">${getAgentStoneSvg(ic,"tomato")}</svg>`).join('\n')

/** Example blocks */
document.getElementById('intro-blocks-1').append(createBlocks('intro-blocks-1-blocks', {'recipient': '(0,0,3)', 'phase': 'learn', 'result': '(0,0,0)'}))
document.getElementById('intro-blocks-2').append(createBlocks('intro-blocks-2-blocks', {'recipient': '(0,0,2)', 'phase': 'learn', 'result': '(0,0,0)'}))
document.getElementById('intro-blocks-3').append(createBlocks('intro-blocks-2-blocks', {'recipient': '(0,0,4)', 'phase': 'learn', 'result': '(0,0,0)'}))

/** Example touch moment */
document.getElementById('intro-touch-1').innerHTML = `<svg class="intro-eg">${getAgentStoneSvg("(2,2,1)","tomato")}</svg>`
document.getElementById('intro-touch-2').append(createBlocks('intro-touch-2-blocks', {'recipient': '(0,0,4)', 'phase': 'learn', 'result': '(0,0,0)'}))
showQuestionMark(document.getElementById('intro-touch-2-blocks-block-3'))

/** Example interface */
const demoConfig = fmtConfig(config.filter(c => c.trial_id==48), 'demo', 'learn')
document.getElementById('intro-demo').append(createLearnTask('intro-demo', demoConfig[0], 0, false))
document.getElementById('intro-demo-test-btn-1').onclick = () => {
  playEffects(demoConfig[0], 'intro-demo', 1, true);
  setTimeout(() => {
    clearInitStones('intro-demo', demoConfig[0])
    createInitStones(demoConfig[0], document.getElementById('intro-demo-displaymain-1'), 'intro-demo')
    document.getElementById('intro-demo-test-btn-1').innerText = 'Test again'
  }, 2000);
}

/** Prep data */
const taskIds = getConfigs(config, cond)

let aliceLearn = fmtConfig(config.filter(c => taskIds['learnA'].indexOf(c.trial_id) > -1), 'alice', 'learn')
let aliceGen = fmtConfig(shuffleArray(config.filter(c => taskIds['genA'].indexOf(c.trial_id) > -1)), 'alice', 'gen')

let bobLearn = fmtConfig(config.filter(c => taskIds['learnB'].indexOf(c.trial_id) > -1), 'bob', 'learn')
bobLearn.map(bl => bl.trial = bl.trial + aliceLearn.length)
let bobGen = fmtConfig(shuffleArray(config.filter(c => taskIds['genB'].indexOf(c.trial_id) > -1)), 'bob', 'gen')
bobGen.map(bg => bg.trial = bg.trial + aliceGen.length)

// let usedIndices = [ aliceLearn, aliceGen, bobLearn, bobGen].flat().map(c => parseInt(c['id'].substring(1)))
// let genConfigs =  config.filter(c => usedIndices.indexOf(c.trial) < 0).slice(0,15)
let genConfigs =  config.filter(c => taskIds['genC'].indexOf(c.trial_id) > -1)
genConfigs = fmtConfig(shuffleArray(genConfigs), 'gen', 'gen')

// For page animation
let aliceLearnClicked = Array(aliceLearn.length).fill(0);
let aliceGenClicked = Array(aliceGen.length).fill(0);
let bobLearnClicked = Array(bobLearn.length).fill(0);
let bobGenClicked = Array(bobGen.length).fill(0);
let genClicked = Array(genConfigs.length).fill(0);

// Data to save
let subjectData = {}
let trialData = prepTrialData([aliceLearn, aliceGen, bobLearn, bobGen].flat())

// Key frame names
const taskCoverA = 'task-cover-a'
const taskTrainA = 'task-train-a'
const taskInputA = 'task-input-a'
const taskGenA = 'task-gen-a'
const taskReputA = 'task-change-a'

const taskCoverB = 'task-cover-b'
const taskTrainB = 'task-train-b'
const taskInputB = 'task-input-b'
const taskGenB = 'task-gen-b'

const taskCoverC = 'task-cover-c'
const taskTrainC = 'task-train-c'
const taskInputC = 'task-input-c'
const taskGenC = 'task-gen-c'

/** Alice */
// learning
for(let i = 0; i < aliceLearn.length; i++ ) {
  let config = aliceLearn[i]
  document.getElementById(taskTrainA).append(createLearnTask(taskTrainA, config, aliceLearn.length))
  let trialId = config.trial

  // Button functionalities
  let playBtn = document.getElementById(`${taskTrainA}-test-btn-${trialId}`);
  let nextBtn = document.getElementById(`${taskTrainA}-next-btn-${trialId}`);
  playBtn.onclick = () => {
    let displayMain = document.getElementById(`${taskTrainA}-displaymain-${trialId}`)
    playBtn.disabled = true;
    if (aliceLearnClicked[i] > 0) {
      clearInitStones(taskTrainA, config)
      createInitStones(config, displayMain, taskTrainA)
    }
    playEffects(config, taskTrainA, aliceLearnClicked[i]);
    setTimeout(() => {
      nextBtn.disabled = false;
      playBtn.disabled = false;
      playBtn.innerText = 'Test again'
    }, 2000);
    aliceLearnClicked[i] += 1;
  }
   nextBtn.onclick = () => {
     nextBtn.disabled = true;
     playBtn.disabled = true;
     let nextDiv = (i === aliceLearn.length-1)? taskInputA: `${taskTrainA}-box-${i+2}`;
     showNext(nextDiv);
   }
}

// Free response
(mode === 'dev')? document.getElementById(taskInputA).style.display = 'flex': null;
document.getElementById(taskInputA).append(createInputForm(taskInputA))

const aliceInputForm = document.getElementById(`${taskInputA}-input-form`)
let aliceOkBtn = document.getElementById(`${taskInputA}-input-submit-btn`)
aliceInputForm.onchange = () => isFilled(`${taskInputA}-input-form`)? aliceOkBtn.disabled = false: null;
aliceOkBtn.onclick = () => {
  let inputs = aliceInputForm.elements;
  Object.keys(inputs).forEach(id => subjectData[inputs[id].name] = inputs[id].value);
  aliceOkBtn.disabled = true;
  disableFormInputs(`${taskInputA}-input-form`);
  // console.log(subjectData)
  hide('task-input-a-button-group-vc')
  showNext(taskGenA, 'block')
}

// Generate gen tasks
for(let i = 0; i < aliceGen.length; i++ ) {
  let config = aliceGen[i]
  // console.log(config)
  document.getElementById(taskGenA).append(createGenTask(taskGenA, config, aliceGen.length))
  document.getElementById(`${taskGenA}-box-${i+1}`).style.display = (i==0)? 'flex': 'none';

  /** Effects and button functionalities */
  genBlocksEffects(config, taskGenA, aliceGenClicked)
  handleGenSelection(config, taskGenA)
  let resetBtn = document.getElementById(`${taskGenA}-reset-btn-${config.trial}`)
  let confirmBtn = document.getElementById(`${taskGenA}-confirm-btn-${config.trial}`)
  resetBtn.onclick = () => {
    aliceGen[i] = 0
    confirmBtn.disabled = true;
    resetGenBlock(config, taskGenA, aliceGen)
  }
  confirmBtn.onclick = () => {
    disableBlocks(config, taskGenA)
    resetBtn.disabled = true
    confirmBtn.disabled = true;
    trialData.selection[aliceLearn.length+i] = `(0,0,${getCurrentSelection(config, taskGenA)})`
    trialData.correct[aliceLearn.length+i] = (trialData.result[aliceLearn.length+i] === trialData.selection[aliceLearn.length+i])? 1 : 0
    // console.log(trialData)
    hide(`${taskGenA}-box-${i+1}`)
    if (i < aliceGen.length-1) {
      showNext(`${taskGenA}-box-${i+2}`);
    } else {
      hide(taskCoverA)
      // hide(taskTrainA)
      hide(taskInputA)
      // hide(taskGenA)
      // showNext(taskReputA, 'block');
      showNext('task-bob', 'block');
    }
  }
}

// Mind-change
(mode === 'dev')? document.getElementById(taskInputA).style.display = 'flex': null;
document.getElementById(taskReputA).append(createMindChangeForm(taskReputA))

let aliceBoolForm = document.getElementById(`${taskReputA}-bool-form`)
let aliceChangeForm = document.getElementById(`${taskReputA}-input-form`)
let aliceBoolOkBtn = document.getElementById(`${taskReputA}-input-submit-btn`)
aliceBoolForm.onclick = () => {
  if (document.getElementsByName('alice-change')[0].checked == 1) {
    aliceMindChange = 1
    showNext(`${taskReputA}-box`, 'block')
    let aliceReputForm = document.getElementById(`${taskReputA}-input-form`)
    aliceReputForm.onchange = () => isFilled(`${taskReputA}-input-form`)? aliceBoolOkBtn.disabled = false: null;
  } else {
    aliceMindChange = 0
    aliceBoolOkBtn.disabled = false;
    }
  }

aliceBoolOkBtn.onclick = () => {
  let inputs = aliceChangeForm.elements;
  Object.keys(inputs).forEach(id => subjectData[inputs[id].name] = inputs[id].value);
  disableFormInputs(`${taskReputA}-input-form`);
  subjectData['task-change-a'] = aliceMindChange
  hide(taskCoverA)
  hide(taskGenA)
  hide(taskInputA)
  hide(taskReputA)
  for (let i=0; i<aliceLearn.length; i++) {
    showNext(`${taskGenA}-box-${i+1}`, 'flex', false);
  }
  showNext('task-bob', 'block');
}

/** Bob */
// learning
for(let i = 0; i < bobLearn.length; i++ ) {
  let config = bobLearn[i]
  let trialId = config.trial

  document.getElementById(taskTrainB).append(createLearnTask(taskTrainB, config, aliceLearn.length))
  document.getElementById(`${taskTrainB}-box-${i+1+aliceLearn.length}`).style.display = (i===0)? 'flex': 'none'

  // Button functionalities
  let playBtn = document.getElementById(`${taskTrainB}-test-btn-${trialId}`);
  let nextBtn = document.getElementById(`${taskTrainB}-next-btn-${trialId}`);
  playBtn.onclick = () => {
    let displayMain = document.getElementById(`${taskTrainB}-displaymain-${trialId}`)
    playBtn.disabled = true;
    if (bobLearnClicked[i] > 0) {
      clearInitStones(taskTrainB, config)
      createInitStones(config, displayMain, taskTrainB)
    }
    playEffects(config, taskTrainB, bobLearnClicked[i]);
    setTimeout(() => {
      nextBtn.disabled = false;
      playBtn.disabled = false;
      playBtn.innerText = 'Test again'
    }, 2000);
    bobLearnClicked[i] += 1;
  }
  nextBtn.onclick = () => {
    nextBtn.disabled = true;
    playBtn.disabled = true;
    let nextDiv = (i === bobLearn.length-1)? taskInputB: `${taskTrainB}-box-${i+2+aliceLearn.length}`;
    showNext(nextDiv);
  }
}

// Free response
(mode === 'dev')? document.getElementById(taskInputB).style.display = 'flex': null;
document.getElementById(taskInputB).append(createInputForm(taskInputB))

let bobInputForm = document.getElementById(`${taskInputB}-input-form`)
let bobOkBtn = document.getElementById(`${taskInputB}-input-submit-btn`)
bobInputForm.onchange = () => isFilled(`${taskInputB}-input-form`)? bobOkBtn.disabled = false: null;
bobOkBtn.onclick = () => {
  let inputs = bobInputForm.elements;
  Object.keys(inputs).forEach(id => subjectData[inputs[id].name] = inputs[id].value);
  bobOkBtn.disabled = true;
  disableFormInputs(`${taskInputB}-input-form`);
  // console.log(subjectData)
  hide('task-input-b-button-group-vc')
  showNext(taskGenB, 'block')
}



// Generate gen tasks
for(let i = 0; i < bobGen.length; i++ ) {
  let config = bobGen[i]

  document.getElementById(taskGenB).append(createGenTask(taskGenB, config, bobGen.length + aliceGen.length))
  document.getElementById(`${taskGenB}-box-${i+1+aliceGen.length}`).style.display = (i==0)? 'flex': 'none';

  /** Effects and button functionalities */
  genBlocksEffects(config, taskGenB, bobGenClicked)
  handleGenSelection(config, taskGenB)
  let resetBtn = document.getElementById(`${taskGenB}-reset-btn-${config.trial}`)
  let confirmBtn = document.getElementById(`${taskGenB}-confirm-btn-${config.trial}`)
  resetBtn.onclick = () => {
    bobGen[i] = 0
    confirmBtn.disabled = true;
    resetGenBlock(config, taskGenB, bobGen)
  }
  confirmBtn.onclick = () => {
    disableBlocks(config, taskGenB)
    resetBtn.disabled = true
    confirmBtn.disabled = true;
    let prevs = [ aliceLearn.length, aliceGen.length, bobLearn.length ].reduce((a, b) => a + b, 0)
    trialData.selection[prevs+i] = `(0,0,${getCurrentSelection(config, taskGenB)})`
    trialData.correct[prevs+i] = (trialData.result[prevs+i] === trialData.selection[prevs+i])? 1 : 0
    if (i < bobGen.length-1) {
      hide(`${taskGenB}-box-${i+1+aliceGen.length}`);
      showNext(`${taskGenB}-box-${i+2+aliceGen.length}`);
    } else {
      // hide(taskCoverA)
      // hide(taskTrainA)
      // hide(taskInputA)
      // hide(taskReputA)
      // hide(taskCoverB)
      // hide(taskTrainB)
      // hide(taskInputB)
      // hide(taskGenB)
      hide('task')
      showNext('debrief', 'block')
    }
  }
}



// Instruction buttons
// const checkScrollHeight = (text, btn) => ((text.scrollTop + text.offsetHeight) >= text.scrollHeight) ? btn.disabled = false : null;
const descNextBtn = document.getElementById('desc-next-btn')

// const instructionText = document.getElementById("instruction-text");
// instructionText.addEventListener("scroll", () => checkScrollHeight(instructionText, descNextBtn), false);
descNextBtn.onclick = () => {
  hide('instruction')
  showNext('comprehension', 'block')
}



// Quiz
const checkBtn = document.getElementById('check-btn');
const checks = [ 'check1', 'check2', 'check3', 'check4', 'check5', 'check6' ];
const answers = [ true, true, true, false, false, true ];

const passBtn = document.getElementById('pass-btn');
const retryBtn = document.getElementById('retry-btn');

checkBtn.onclick = () => {
  checkBtn.style.display = 'none';
  let inputs = [];
  checks.map(check => {
    const vals = document.getElementsByName(check);
    inputs.push(vals[0].checked);
  });
  const pass = (inputs.join('') === answers.join(''));
  if (pass) {
    showNext('pass', 'block')
  } else {
    showNext('retry', 'block')
  }
}

passBtn.onclick = () => {
  start_task_time = Date.now();
  hide("pass");
  hide("comprehension");
  showNext("task-alice", "block");
};
retryBtn.onclick = () => {
  hide("retry");
  hide("comprehension");
  showNext("instruction", "block")
  checkBtn.style.display = 'flex';
};

document.getElementById('prequiz').onchange = () => compIsFilled() ? checkBtn.disabled = false : null;


// Bebrief
const doneBtn = document.getElementById('done-btn');
const debriefForm = document.getElementById('postquiz');

debriefForm.onchange = () => {
  isFilled('postquiz')? doneBtn.disabled = false: null;
}
doneBtn.onclick = () => {
  let inputs = debriefForm.elements;
  Object.keys(inputs).forEach(id => subjectData[inputs[id].name] = inputs[id].value);

  const end_time = new Date();
  let token = generateToken(8);
  let nCorrect = trialData['correct'].reduce((a, b) => a + b, 0)

  let clientData = {};
  clientData.subjectwise = subjectData;
  clientData.subjectwise.condition = cond;
  clientData.subjectwise.date = formatDates(end_time, 'date');
  clientData.subjectwise.time = formatDates(end_time, 'time');
  clientData.subjectwise.instructions_duration = start_task_time - start_time,
  clientData.subjectwise.task_duration = end_time - start_task_time,
  clientData.subjectwise.token = token;
  clientData.subjectwise.correct = nCorrect;
  clientData.trialwise = trialData;

  // /** Give feedback */
  // const truths = genConfigs.map(c => c[4])
  // const predicted = trialData.result.slice(learnConfigs.length,);
  // let correct = 0;
  // truths.forEach((t, i) => (t===predicted[i])? correct+=1: null);
  // clientData.subject.correct = correct;

  if (mode === 'flask') {
		const submit_url = doneBtn.getAttribute("data-submit-url");
    console.log(clientData)
    fetch(submit_url, {
        method: 'POST',
        body: JSON.stringify(clientData),
    })
    .then(() => showCompletion(token, nCorrect))
    .catch((error) => console.log(error));
  } else {
    showCompletion(token, nCorrect);
    // console.log(clientData);
    download(JSON.stringify(clientData), 'data.txt', '"text/csv"');
  }
};



// Dev buttons
const devSkipIntro = document.getElementById('dev-skip-intro')
devSkipIntro.style.display = (mode==='dev'|mode==='test')? 'block': 'none'
devSkipIntro.onclick = () => {
  hide('instruction')
  hide('comprehension')
  hide('pass')
  hide('retry')
  showNext('task-alice', 'block')
}

const devSkipAlice = document.getElementById('dev-skip-alice')
devSkipAlice.style.display = (mode==='dev'|mode==='test')? 'block': 'none'
devSkipAlice.onclick = () => {
  showNext(taskCoverA, 'block', false)
  showNext(taskTrainA, 'block', false)
  showNext(taskInputA, 'block', false)
  showNext(taskGenA, 'block', false)
  showNext(taskReputA, 'block', false)
}

const devSkipBob = document.getElementById('dev-skip-bob')
devSkipBob.style.display = (mode==='dev'|mode==='test')? 'block': 'none'
devSkipBob.onclick = () => {
  hide(taskTrainA)
  hide(taskInputA)
  hide(taskCoverB)
  hide(taskTrainB)
  hide(taskInputB)
  hide(taskGenB)
  showNext('debrief', 'block')
}
