import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, type ReactNode } from "react";

type ControlGroupProps = {
  title: string;
  tone?: "teal" | "amber" | "slate";
  defaultOpen?: boolean;
  children: ReactNode;
};

export function ControlGroup({
  title,
  tone = "teal",
  defaultOpen = true,
  children,
}: ControlGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`control-group tone-${tone} ${open ? "is-open" : ""}`}>
      <button
        className="group-heading"
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
      >
        <span className="group-dot" />
        <span>{title}</span>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && <div className="group-body">{children}</div>}
    </section>
  );
}

export function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="segmented" role="tablist">
      {options.map(option => (
        <button
          key={option}
          className={value === option ? "active" : ""}
          onClick={() => onChange(option)}
          role="tab"
          aria-selected={value === option}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function SliderField({
  label,
  value,
  min,
  max,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="slider-field">
      <span className="slider-label">
        <span>{label}</span>
        <strong>
          {value}
          {suffix}
        </strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export function TinyColor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="tiny-color" title="选择颜色">
      <input
        type="color"
        value={value}
        onChange={event => onChange(event.target.value)}
      />
      <span style={{ background: value }} />
      <code>{value.toUpperCase()}</code>
    </label>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="switch-row">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={event => onChange(event.target.checked)}
      />
      <i />
    </label>
  );
}
