import React, { useRef, useState, useEffect } from 'react'
import axios from 'axios'
import{Route, Link} from 'react-router-dom'
import Editor from './components/Editor';
import SelectOption from './components/SelectOption';
import NotesList from './components/NotesList';
import Search from './components/Search';
import Header from './components/Header';
import LogOut from './components/LogOut'
import LoginPage from './components/Login'
import Register from './components/Register'
import PersistentDrawerLeft from './components/Drawer';
import CardList from './components/CardList';
import Home from './components/Home'
import { db, storage } from './config/firebase';
import {Switch, Redirect} from 'react-router-dom'
import { fontSizes, languageToEditorMode, themes } from './config/EditorOptions'
import ResourcesList from './Resources/Resources'
import { navbarList, signInList } from './utility/NavUtil'
import {nanoid} from 'nanoid'

import './App.css';

function App() {
  const languages = Object.keys(languageToEditorMode)

  const idleStatus = 'Idle';
  const runningStatus = 'running';
  const compeletedStatus = 'completed';
  const errorStatus = 'Some error occured';

  const [language, setLanguage] = useState('c');
  const [theme, setTheme] = useState(themes[0])
  const [fontSize, setFontSize] = useState('16')
  const [body, setBody] = useState('')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [submissionStatus, setSubmissionStatus] = useState(idleStatus)
  const [submissionId, setSubmissionId] = useState('')
  const [submissionCheckerId, setSubmissionCheckerId] = useState(null);
  const [isLoggedin, setIsLoggedIn] = useState(false);
  const [notes, setNotes] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [userId, setUserId] = useState('');
  const [resLang, setResLang] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const loadNotes = () => {
    const noteRef = db.collection('notes')
    noteRef.where('id', '==', userId).get()
      .then(s => {
        let savedNotes = []
        s.forEach(data => { savedNotes = [...savedNotes, data.data()] })

        if (savedNotes) {
          setNotes(savedNotes);

        }
      })
      .catch(err => {
        console.log(err)
      })
  }


  const addNote = (text) => {
    const noteRef = db.collection('notes')
    const date = new Date();
    const newNote = {
      id: userId,
      text: text,
      noteId: nanoid(),
      timestamp: date.toLocaleDateString(),
    };


    db.collection('notes').doc().set(newNote).then(s => {
      const newNotes = [...notes, newNote];
      setNotes(newNotes);
      alert("note added succefully")
    })
      .catch(err => {
        alert("error occured")
      })

  };

  const deleteNote = (id) => {
    const noteRef = db.collection('notes').where('noteId', '==', id)
    noteRef.get()
      .then(s => {
        s.forEach(data => data.ref.delete())
        const newNotes = notes.filter((note) => note.noteId !== id);
        setNotes(newNotes);
      })
      .catch(err =>
        alert("error occured")
      )
  };


  const fileInput = useRef(null);

  const visionAPI = () => {
    const fileName = fileInput.current.files[0]
    setIsLoading(true)
    if (!fileName) alert("please select image")
    const uploadTask = storage.ref(`${fileName.name}`).put(fileName);
    uploadTask.on(
      "state_changed",
      snapshot => { },
      error => {
        console.log(error);
      },
      () => {
        storage
          .ref(fileName.name)
          .getDownloadURL()
          .then(url => {
            db.collection('photos').doc(fileName.name).get().then(
              data => {
                setBody(data.data().labels)
                setIsLoading(false)
              }
            );

          });
      }
    );



  }

  //----------Executing the code------------------

  useEffect(() => {
    if (submissionCheckerId && submissionStatus === compeletedStatus) {
      clearInterval(submissionCheckerId);
      setSubmissionCheckerId(null);

      const params = new URLSearchParams({
        id: submissionId,
        api_key: 'guest'
      });
      const querystring = params.toString();
      axios.get(`https://api.paiza.io/runners/get_details?${querystring}`).then((res) => {
        const { stdout, stderr, build_stderr } = res.data;
        console.log(res.data);
        let output = '';
        if (stdout) output += stdout;
        if (stderr) output += stderr;
        if (build_stderr) output += build_stderr;
        console.log(output)
        setOutput(output);

      });
    }
  }, [submissionStatus]);

  ///handling submission of the code by the user for compilation
  const handleSubmit = () => {
    if (submissionStatus === runningStatus) return;
    setSubmissionStatus(runningStatus);

    const params = {
      source_code: body,
      language: language,
      input: input,
      api_key: 'guest'
    };
    axios.post(`https://api.paiza.io/runners/create`, params)
      .then((res) => {
        const { id, status } = res.data;
        setSubmissionId(id);
        setSubmissionStatus(status);
      })
      .catch((err) => {
        setSubmissionId('');
        setSubmissionStatus(errorStatus);
      });
  };

  useEffect(() => {
    if (submissionId) {
      setSubmissionCheckerId(setInterval(() => updateSubmissionStatus(), 1000));
    }
  }, [submissionId]);

  // for checking the status of execution of the program
  const updateSubmissionStatus = () => {
    const params = new URLSearchParams({
      id: submissionId,
      api_key: 'guest'
    });
    const querystring = params.toString();
    axios.get(`https://api.paiza.io/runners/get_status?${querystring}`).then((res) => {
      const { status } = res.data;
      setSubmissionStatus(status);
    });
  };

  const handleDownload = () => {
    if (body.length === 0) {
      alert("Body of editor is empty")
      return
    }

    const element = document.createElement("a");
    const file = new Blob([body],
      { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = prompt("Name of the file:") || language + Date.now()
    document.body.appendChild(element);
    element.click();
  }


  const handleFileChange = (e) => {
    console.log(e.target.value)
  }
  const handleUpdateBody = (value) => {
    setBody(value);
    console.log(value)
  };

  const handleUpdateInput = (value) => {
    setInput(value);
  };

  const Navbar = () => {
    return (
      <div>

        {isLoggedin
          ?
          <PersistentDrawerLeft loadNotes={loadNotes} navbarList={navbarList} currTitle={'QuickCode'} />
          :
          <PersistentDrawerLeft navbarList={signInList} currTitle={'QuickCode'} />
        }
      </div>
    )
  }

  const Notes = () => {

    return (
      <div className={`${darkMode && 'dark-mode'}`} >
        <Header handleToggleDarkMode={setDarkMode} />
        <Search handleSearchNote={setSearchText} />
        <NotesList
          notes={notes.filter((note) =>
            note.text.toLowerCase().includes(searchText)
          )}
          handleAddNote={addNote}
          handleDeleteNote={deleteNote}
        />
      </div>
    )
  }


  const Resources = () => {
    return (
      <div>
        <Search handleSearchNote={setResLang} />
        {

          ["Java", "Python", "C", "C++", "Javascript"].map((lang, ind) => {

            return (
              <button className="btn btn-outline-primary mx-3 my-3" value={lang} onClick={(lang) => setResLang(lang.target.innerText)} key={ind}><b>{lang}</b></button>
            )
          })

        }

        <CardList resources={ResourcesList.filter(itm => (resLang.toLowerCase().includes(itm.name.toLowerCase()) || resLang.toLowerCase().includes(itm.topic[0].toLowerCase())))} />
      </div>
    )
  }


  return (
    <div className="container-lg">
      <Navbar />
      <Switch>
        {
          isLoggedin ?
            <>

              <Route path="/login" render={(props) =>
                <LoginPage {...props} setUserId={(id) => setUserId(id)} setIsLoggedIn={(val) => setIsLoggedIn(val)} />} />
              <Route path="/register" component={Register} />
              <Route path="/editor" >
                <div>
                  <div className="mb-2">
                    <SelectOption
                      label="Language"
                      defaultValue={language}
                      setValue={(val) => setLanguage(val)}
                      values={languages}
                    />
                  </div>

                  <div className="mb-2">
                    <SelectOption
                      label="Theme"
                      defaultValue={theme}
                      setValue={setTheme}
                      values={themes}
                    />

                  </div>
                  <div className="mb-2">
                    <SelectOption
                      label="Font Size"
                      defaultValue={fontSize}
                      setValue={setFontSize}
                      values={fontSizes}
                    />
                  </div>

                  <div className="col-lg-6 col-sm-12 mb-2 mt-3">
                    <div className="d-flex align-items-center justify-content-between mb-2" >
                      <label for="file-upload" class="custom-file-upload btn-outline-success">
                        <i class="fa fa-cloud-upload"></i> Upload Image
                      </label>

                      <input
                        id="file-upload"

                        type="file"
                        onChange={handleFileChange}
                        ref={fileInput}

                      />



                      <button class="btn btn-outline-success mx-3" onClick={visionAPI} >Get Code</button>

                    </div>
                    <div>
                      <p><i>Note: after selecting image press get code</i></p>
                    </div>
                    <div>
                      {isLoading ? <p>Loading ...</p> : null}
                    </div>


                    {/* <div className="d-flex justify-content-between mb-2">
                      <button class="btn btn-outline-success" onClick={handleSubmit} >Submit</button>
                      <button class="btn btn-outline-success" onClick={handleDownload} >Download</button>
                    </div> */}

                    <div>

                    </div>

                  </div>
                  <div className="row" >
                    <div className="col-lg-6 col-sm-12 mb-2 mx-0 pe-0" >
                      <p>EDITOR</p>


                      <Editor

                        language={languageToEditorMode[language]}
                        theme={theme}
                        body={body}
                        handleBodyChange={(val) => handleUpdateBody(val)}
                        readOnly={false}
                        fontSize={fontSize}
                        width="100%"
                      />
                      <div className="d-flex justify-content-between my-2">
                        <button class="btn btn-outline-success" onClick={handleSubmit} >Submit</button>
                        <button class="btn btn-outline-success" onClick={handleDownload} >Download</button>
                      </div>
                    </div>

                    <div className="col-lg-6 col-sm-12" >
                      <p>INPUT</p>
                      <Editor
                        language=''
                        theme={theme}
                        body={input}
                        handleBodyChange={handleUpdateInput}
                        readOnly={false}
                        fontSize={fontSize}
                        height='150px'

                      />

                    </div>
                    <div className="col-sm-12" >
                      <p>OUTPUT</p>
                      <Editor
                        language=""
                        theme={theme}
                        body={output}
                        handleBodyChange={setOutput}
                        readOnly={true}
                        fontSize={fontSize}
                        height='250px'

                      />
                    </div>
                  </div>
                </div>
              </Route>
              <Route path="/notes" >
                <div className={`${darkMode && 'dark-mode'}`} >
                  <Header handleToggleDarkMode={setDarkMode} />
                  <Search handleSearchNote={setSearchText} />
                  <NotesList
                    notes={notes.filter((note) =>
                      note.text.toLowerCase().includes(searchText)
                    )}
                    handleAddNote={addNote}
                    handleDeleteNote={deleteNote}
                  />
                </div>
              </Route>
              <Route path="/resources" component={Resources} >
                <div>
                  <Search handleSearchNote={setResLang} />
                  {

                    ["Java", "Python", "C", "C++", "Javascript"].map((lang, ind) => {

                      return (
                        <button className="btn btn-outline-primary mx-3 my-3" value={lang} onClick={(lang) => setResLang(lang.target.innerText)} key={ind}><b>{lang}</b></button>
                      )
                    })

                  }

                  <CardList resources={ResourcesList.filter(itm => itm.topic[0].toLowerCase() === resLang.toLowerCase())} />
                </div>
              </Route>
              <Route path="/logout" component={LogOut} />
              <Route exact path='/' >
                <Home isLoggedin={isLoggedin} />
              </Route>
            </>
            :
            <>
              <Switch>
                <Route path="/login" render={(props) =>
                  <LoginPage {...props} setUserId={(id) => setUserId(id)} setIsLoggedIn={(val) => setIsLoggedIn(val)} />} />
                <Route path="/register" component={Register} />
                <Route exact path='/' >
                  <Home isLoggedin={isLoggedin} />
                </Route>
                <Redirect from='*' to='/' />
              </Switch>

            </>
        }

      </Switch>
    </div>
 
    );
}

export default App;
