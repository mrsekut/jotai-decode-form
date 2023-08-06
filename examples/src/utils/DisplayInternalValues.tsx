type Props = {
  value: unknown;
  label?: string | undefined;
};

export const DisplayInternalValue: React.FC<Props> = ({ value, label }) => {
  const l = label ? `(${label})` : '';

  return (
    <div className="display_internal_values">
      <div>
        value {l}: {JSON.stringify(value)}
      </div>
      <div>type: {typeof value}</div>
    </div>
  );
};
