import './App.css';
import { Field as SimpleField } from './fields/simple';

function App() {
  return (
    <>
      <h1>Examples</h1>
      <div className="examples">
        <FieldLayout label="simple">
          <SimpleField />
        </FieldLayout>
      </div>
    </>
  );
}

export default App;

const FieldLayout: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => {
  return (
    <div className="example_layout">
      <h3>{label}</h3>
      <div>{children}</div>
    </div>
  );
};
