import { useEffect, useState } from 'react'
import * as WorkspaceAPI from "trimble-connect-workspace-api"
import SectionPlanesCreator from './components/SectionPlanesCreator'
import MarkupAnnotations from './components/MarkupAnnotations'
import ElementSearch from './components/ElementSearch'
import '@trimbleinc/modus-bootstrap/dist/modus.min.css';
import '@trimble-oss/modus-icons/dist/modus-outlined/fonts/modus-icons.css';
import './App.css'

function App() {
  const [tcApi, setTcApi] = useState<WorkspaceAPI.WorkspaceAPI>()

  useEffect(() => {
    async function connectWithTcAPI() {
      const api = await WorkspaceAPI.connect(window.parent, (_event: any, _data: any) => {

      });

      setTcApi(api);
    }

    connectWithTcAPI();
  }, []);

  return (
    <>
      <h2 className='title'>Productivity Tools</h2>
      <div>
        <SectionPlanesCreator api={tcApi as WorkspaceAPI.WorkspaceAPI}></SectionPlanesCreator>
        <MarkupAnnotations api={tcApi as WorkspaceAPI.WorkspaceAPI}></MarkupAnnotations>
        <ElementSearch api={tcApi as WorkspaceAPI.WorkspaceAPI}></ElementSearch>
      </div>
    </>
  )
}

export default App
