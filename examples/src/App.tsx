import './App.css';
import { Field as SimpleField } from './fields/simple';
import { Field as BasicNumberField } from './fields/basic_number';
import { Field as TransUnitField } from './fields/trans_unit';
import { Field as SelectField } from './fields/select';
import { Field as DateField } from './fields/date';

function App() {
  return (
    <>
      <h1>Examples</h1>
      <div className="examples">
        <FieldLayout label="simple">
          <SimpleField />
        </FieldLayout>

        <FieldLayout label="basic number">
          <BasicNumberField />
        </FieldLayout>

        <FieldLayout label="trans unit number">
          <TransUnitField />
        </FieldLayout>

        <FieldLayout label="selectbox">
          <SelectField />
        </FieldLayout>

        <FieldLayout label="date">
          <DateField />
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
