import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Printer } from "lucide-react";
import { company, cmvNote, eeoStatement, employmentHistoryNote, fcraStatement, fmcsrNote, investigationRelease } from "@/lib/company";
import { submitApplication } from "@/lib/inbox.functions";

type YesNo = "" | "yes" | "no";

type Employer = {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  contact: string;
  phone: string;
  from: string;
  to: string;
  position: string;
  salary: string;
  reason: string;
  fmcsr: YesNo;
  part40: YesNo;
};

type Row3 = { a: string; b: string; c: string; d: string; e: string };

const blankEmployer = (): Employer => ({
  name: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  contact: "",
  phone: "",
  from: "",
  to: "",
  position: "",
  salary: "",
  reason: "",
  fmcsr: "",
  part40: "",
});

const blankRow = (): Row3 => ({ a: "", b: "", c: "", d: "", e: "" });

const equipment = [
  "Straight truck",
  "Tractor and semi-trailer",
  "Tractor – two trailers",
  "Tractor – three trailers",
  "Motorcoach / school bus, more than 8 passengers",
  "Motorcoach / school bus, more than 15 passengers",
  "Other",
] as const;

const steps = [
  "Company & release",
  "About you",
  "Employment",
  "Driving record",
  "On-duty hours",
  "Releases",
  "Review",
];

export function ApplyWizard() {
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step, savedId]);
  const [form, setForm] = useState(() => ({
    position: "Company driver",
    firstName: "",
    middle: "",
    lastName: "",
    ssn: "",
    email: "",
    phone: "",
    dob: "",
    proofOfAge: "" as YesNo,
    legalRight: "" as YesNo,
    street: "",
    city: "",
    state: "",
    zip: "",
    howLong: "",
    previous: [
      { street: "", city: "", stateZip: "", howLong: "" },
      { street: "", city: "", stateZip: "", howLong: "" },
      { street: "", city: "", stateZip: "", howLong: "" },
    ],
    workedHere: "" as YesNo,
    workedWhere: "",
    workedFrom: "",
    workedTo: "",
    workedPay: "",
    workedPosition: "",
    workedReason: "",
    employedNow: "" as YesNo,
    sinceLeft: "",
    referredBy: "",
    payExpected: "",
    bonded: "" as YesNo,
    bondingCompany: "",
    felony: "" as YesNo,
    felonyExplain: "",
    unable: "" as YesNo,
    unableExplain: "",
    employers: [blankEmployer(), blankEmployer(), blankEmployer()],
    accidentsNone: false,
    accidents: [blankRow(), blankRow(), blankRow()],
    ticketsNone: false,
    tickets: [blankRow(), blankRow(), blankRow()],
    licenses: [
      { state: "", number: "", className: "", endorsements: "", expires: "" },
      { state: "", number: "", className: "", endorsements: "", expires: "" },
    ],
    denied: "" as YesNo,
    suspended: "" as YesNo,
    licenseDetails: "",
    experience: equipment.map(() => ({ yes: "" as YesNo, types: "", from: "", to: "", miles: "" })),
    statesOperated: "",
    courses: "",
    awards: "",
    otherExperience: "",
    otherTraining: "",
    specialEquipment: "",
    gradeSchool: "",
    highSchool: "",
    college: "",
    lastSchool: "",
    hours: ["", "", "", "", "", "", ""],
    hourDates: ["", "", "", "", "", "", ""],
    lastRelievedTime: "",
    lastRelievedAmPm: "A.M.",
    lastRelievedOn: "",
    hoursInitials: "",
    otherEmployerNow: "" as YesNo,
    intendOther: "" as YesNo,
    drugPositive: "" as YesNo,
    returnToDuty: "" as YesNo,
    sphPreviousEmployer: "",
    sphStreet: "",
    sphCity: "",
    sphEmail: "",
    sphPhone: "",
    sphFax: "",
    drug644Employer: "",
    drug644Address: "",
    drug644Signed: "",
    sphRebuttal: "",
    sphRebuttalSigned: "",
    releaseSigned: "",
    fcraSigned: "",
    recordSigned: "",
    licenseSigned: "",
    hoursSigned: "",
    drugSigned: "",
    sphSigned: "",
    testSigned: "",
    finalSigned: "",
    signDate: "",
  }));

  const totalHours = useMemo(
    () => form.hours.reduce((sum, value) => sum + (Number(value) || 0), 0),
    [form.hours],
  );

  function patch(partial: Partial<typeof form>) {
    setForm((current) => ({ ...current, ...partial }));
  }

  function validate(index: number): string | null {
    if (index === 0 && !form.releaseSigned.trim()) return "Sign the investigation release with your legal name.";
    if (index === 1) {
      if (!form.firstName || !form.lastName || !form.phone || !form.email || !form.street || !form.city || !form.state || !form.zip) {
        return "Name, phone, email, and current address are required.";
      }
      if (!form.ssn.trim() || !form.dob || !form.legalRight || !form.position) return "Position, Social Security number, date of birth, and work authorization are required.";
    }
    if (index === 2) {
      const first = form.employers[0];
      if (!first?.name || !first.fmcsr || !first.part40) return "List your most recent employer, including the FMCSR and Part 40 questions.";
    }
    if (index === 3) {
      if (!form.licenses[0]?.state || !form.licenses[0]?.number) return "Enter at least one license from the past 3 years.";
      if (!form.denied || !form.suspended) return "Answer the license denial and suspension questions.";
      if ((form.denied === "yes" || form.suspended === "yes") && !form.licenseDetails.trim()) return "Give details if a license was denied, suspended, or revoked.";
      if (!form.finalSigned.trim()) return "Sign the certification that the application is true and complete.";
    }
    if (index === 4) {
      if (!form.lastRelievedTime || !form.lastRelievedOn || !form.otherEmployerNow || !form.intendOther || !form.hoursSigned.trim() || !form.hoursInitials.trim()) {
        return "Complete the 7-day hours statement, including your initials, when you were last relieved, and both other-work questions.";
      }
    }
    if (index === 5) {
      if (!form.fcraSigned || !form.recordSigned || !form.licenseSigned || !form.drugSigned || !form.sphSigned || !form.testSigned || !form.drug644Signed.trim()) {
        return "Each release needs your signed name, including the previous-employer drug and alcohol release.";
      }
      if (!form.drugPositive) return "Answer the pre-employment drug and alcohol question.";
      if (form.drugPositive === "yes" && !form.returnToDuty) return "If you answered yes, say whether you can document return-to-duty.";
      if (!form.sphPreviousEmployer.trim() || !form.drug644Employer.trim()) return "Name the previous employer for the safety performance history request and for form 644-F. Write “none” if you have no DOT employer in the last 3 years.";
    }
    return null;
  }

  function next() {
    const problem = validate(step);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setStep((value) => Math.min(value + 1, steps.length - 1));
  }

  function submit() {
    for (let index = 0; index < steps.length - 1; index += 1) {
      const problem = validate(index);
      if (problem) {
        setStep(index);
        setError(problem);
        return;
      }
    }
    if (!form.signDate) {
      setError("Date the application.");
      return;
    }
    setBusy(true);
    setError("");
    const payload = {
      ...form,
      totalHours,
      company: {
        name: company.name,
        address: `${company.street}, ${company.suite}`,
        city: company.city,
        state: company.state,
        zip: company.zip,
        phone: company.phone,
        fax: company.fax,
        email: company.email,
        attention: `${company.safety.name}, ${company.safety.title}`,
      },
      forms: ["691", "730", "729", "644-F", "1617", "886-FS-C2", "9652", "375-FS-C2"],
    };
    void submitApplication({ data: payload })
      .then((result) => setSavedId(result.id))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Couldn’t save the application."))
      .finally(() => setBusy(false));
  }

  if (savedId) {
    const mailto = `mailto:${company.email}?subject=${encodeURIComponent(`Driver application #${savedId}`)}&body=${encodeURIComponent(
      `Driver application #${savedId} for ${form.firstName} ${form.lastName} is logged on the Alpha Leasing site.\nPhone: ${form.phone}\nEmail: ${form.email}\nPosition: ${form.position}`,
    )}`;
    return (
      <div className="rounded-3xl bg-card p-6 ring-1 ring-line md:p-10">
        <p className="text-xs font-semibold tracking-widest text-red uppercase">Application {savedId}</p>
        <h1 className="mt-2 font-display text-5xl tracking-wide">Logged with safety</h1>
        <PrintApplication className="mt-6" />
        <p className="mt-4 max-w-2xl text-sm leading-6 text-steel">
          {form.firstName}, your driver application is in the Alpha Leasing office log for {company.safety.name}, {company.safety.title}. The paper channels are still open if you want a copy in their inbox the old way:
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6">
          <li>Click on Driver Application — done.</li>
          <li>Print the application — optional. Your answers are already saved.</li>
          <li>Fill it out — done.</li>
          <li>
            Scan and email application to{" "}
            <a className="text-red underline-offset-4 hover:underline" href={mailto}>
              {company.email}
            </a>
          </li>
          <li>Or fax to {company.fax}</li>
          <li>
            Or mail to:
            <br />
            Alpha Leasing
            <br />
            {company.street}
            <br />
            {company.suite}
            <br />
            {company.city}, {company.state} {company.zip}
          </li>
        </ol>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
      <aside className="rounded-3xl bg-black p-5 text-snow ring-1 ring-red/50 lg:sticky lg:top-24 lg:self-start">
        <p className="text-xs font-semibold tracking-widest text-red uppercase">New driver packet</p>
        <h1 className="mt-2 font-display text-3xl tracking-wide">Driver’s application for employment</h1>
        <PrintApplication className="mt-4 w-full" />
        <ol className="mt-4 space-y-1 text-sm">
          {steps.map((label, index) => (
            <li key={label}>
              <button
                type="button"
                className={`w-full rounded-lg px-2 py-2 text-left ${index === step ? "bg-red text-snow" : "text-snow/80"}`}
                onClick={() => {
                  if (index < step) setStep(index);
                }}
              >
                {index + 1}. {label}
              </button>
            </li>
          ))}
        </ol>
        <CompanyCard />
      </aside>

      <div className="rounded-3xl bg-card p-5 ring-1 ring-line md:p-8">
        <div className="mb-6 h-1 rounded-full bg-line">
          <div className="h-1 rounded-full bg-red" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
        <p className="text-xs font-semibold tracking-widest text-steel uppercase">
          Step {step + 1} of {steps.length}
        </p>
        <h2 className="font-display text-4xl tracking-wide">{steps[step]}</h2>

        <div className="mt-6 grid gap-4">
          {step === 0 ? <StepCompany form={form} patch={patch} /> : null}
          {step === 1 ? <StepYou form={form} patch={patch} /> : null}
          {step === 2 ? <StepWork form={form} patch={patch} /> : null}
          {step === 3 ? <StepDrive form={form} patch={patch} /> : null}
          {step === 4 ? <StepHours form={form} patch={patch} totalHours={totalHours} /> : null}
          {step === 5 ? <StepReleases form={form} patch={patch} /> : null}
          {step === 6 ? <StepReview form={form} patch={patch} totalHours={totalHours} /> : null}
        </div>

        {error ? <p className="mt-4 text-sm text-red">{error}</p> : null}

        <div className="mt-6 flex flex-wrap gap-3">
          {step > 0 ? (
            <button type="button" className="h-11 rounded-full border border-line px-5" onClick={() => { setError(""); setStep((value) => value - 1); }}>
              Back
            </button>
          ) : null}
          {step < steps.length - 1 ? (
            <button type="button" className="h-11 rounded-full bg-red px-5 text-sm font-semibold text-snow" onClick={next}>
              Continue
            </button>
          ) : (
            <button type="button" disabled={busy} className="h-11 rounded-full bg-red px-5 text-sm font-semibold text-snow disabled:opacity-60" onClick={submit}>
              {busy ? "Saving…" : "Submit application"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PrintApplication({ className = "" }: { className?: string }) {
  return (
    <a
      href="/media/driver-application.pdf?v=3"
      target="_blank"
      rel="noreferrer"
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full bg-red px-5 text-sm font-semibold text-snow ${className}`}
    >
      <Printer size={16} aria-hidden />
      Print application
    </a>
  );
}

function CompanyCard() {
  return (
    <div className="mt-6 border-t border-red/20 pt-4 text-xs leading-5 text-snow/80">
      <p className="font-semibold text-snow">{company.name}</p>
      <p>{company.street}</p>
      <p>{company.suite}</p>
      <p>
        {company.city}, {company.state} {company.zip}
      </p>
      <p>Phone {company.phone}</p>
      <p>Fax {company.fax}</p>
      <p>{company.email}</p>
      <p>{company.hours}</p>
      <p className="mt-2">Attention: {company.safety.name}, {company.safety.title}</p>
    </div>
  );
}

type FormState = {
  position: string;
  firstName: string;
  middle: string;
  lastName: string;
  ssn: string;
  email: string;
  phone: string;
  dob: string;
  proofOfAge: YesNo;
  legalRight: YesNo;
  street: string;
  city: string;
  state: string;
  zip: string;
  howLong: string;
  previous: { street: string; city: string; stateZip: string; howLong: string }[];
  workedHere: YesNo;
  workedWhere: string;
  workedFrom: string;
  workedTo: string;
  workedPay: string;
  workedPosition: string;
  workedReason: string;
  employedNow: YesNo;
  sinceLeft: string;
  referredBy: string;
  payExpected: string;
  bonded: YesNo;
  bondingCompany: string;
  felony: YesNo;
  felonyExplain: string;
  unable: YesNo;
  unableExplain: string;
  employers: Employer[];
  accidentsNone: boolean;
  accidents: Row3[];
  ticketsNone: boolean;
  tickets: Row3[];
  licenses: { state: string; number: string; className: string; endorsements: string; expires: string }[];
  denied: YesNo;
  suspended: YesNo;
  licenseDetails: string;
  experience: { yes: YesNo; types: string; from: string; to: string; miles: string }[];
  statesOperated: string;
  courses: string;
  awards: string;
  otherExperience: string;
  otherTraining: string;
  specialEquipment: string;
  gradeSchool: string;
  highSchool: string;
  college: string;
  lastSchool: string;
  hours: string[];
  hourDates: string[];
  lastRelievedTime: string;
  lastRelievedAmPm: string;
  lastRelievedOn: string;
  otherEmployerNow: YesNo;
  intendOther: YesNo;
  drugPositive: YesNo;
  returnToDuty: YesNo;
  sphPreviousEmployer: string;
  sphStreet: string;
  sphCity: string;
  sphEmail: string;
  sphPhone: string;
  sphFax: string;
  hoursInitials: string;
  drug644Employer: string;
  drug644Address: string;
  drug644Signed: string;
  sphRebuttal: string;
  sphRebuttalSigned: string;
  releaseSigned: string;
  fcraSigned: string;
  recordSigned: string;
  licenseSigned: string;
  hoursSigned: string;
  drugSigned: string;
  sphSigned: string;
  testSigned: string;
  finalSigned: string;
  signDate: string;
};

function StepCompany({ form, patch }: { form: FormState; patch: (partial: Partial<FormState>) => void }) {
  return (
    <>
      <p className="text-sm leading-6 text-steel">
        You are applying to {company.name}, {company.street}, {company.suite}, {company.city}, {company.state} {company.zip}. Phone {company.phone}. Fax {company.fax}. {company.email}.
      </p>
      <Legal>{eeoStatement}</Legal>
      <Legal title="To be read and signed by applicant">{investigationRelease}</Legal>
      <Field label="Signature (legal name)" value={form.releaseSigned} onChange={(releaseSigned) => patch({ releaseSigned })} />
      <Field label="Date" type="date" value={form.signDate} onChange={(signDate) => patch({ signDate })} />
    </>
  );
}

function StepYou({ form, patch }: { form: FormState; patch: (partial: Partial<FormState>) => void }) {
  return (
    <>
      <p className="text-sm text-steel">Applicant to complete. Answer all questions.</p>
      <Field label="Position applied for" value={form.position} onChange={(position) => patch({ position })} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Last" value={form.lastName} onChange={(lastName) => patch({ lastName })} />
        <Field label="First" value={form.firstName} onChange={(firstName) => patch({ firstName })} />
        <Field label="Middle" value={form.middle} onChange={(middle) => patch({ middle })} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Social Security no." value={form.ssn} onChange={(ssn) => patch({ ssn })} />
        <Field label="Email" type="email" value={form.email} onChange={(email) => patch({ email })} />
        <Field label="Phone" value={form.phone} onChange={(phone) => patch({ phone })} />
        <Field label="Date of birth (required for commercial drivers)" type="date" value={form.dob} onChange={(dob) => patch({ dob })} />
      </div>
      <p className="text-sm font-medium">Current address — list residences for the past 3 years.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Street" value={form.street} onChange={(street) => patch({ street })} />
        <Field label="City" value={form.city} onChange={(city) => patch({ city })} />
        <Field label="State" value={form.state} onChange={(state) => patch({ state })} />
        <Field label="Zip" value={form.zip} onChange={(zip) => patch({ zip })} />
        <Field label="How long? (yr./mo.)" value={form.howLong} onChange={(howLong) => patch({ howLong })} />
      </div>
      {form.previous.map((row, index) => (
        <div key={index} className="grid gap-3 rounded-2xl border border-line p-3 sm:grid-cols-2">
          <p className="text-sm font-medium sm:col-span-2">Previous address {index + 1}</p>
          <Field label="Street" value={row.street} onChange={(street) => {
            const previous = [...form.previous];
            previous[index] = { ...row, street };
            patch({ previous });
          }} />
          <Field label="City" value={row.city} onChange={(city) => {
            const previous = [...form.previous];
            previous[index] = { ...row, city };
            patch({ previous });
          }} />
          <Field label="State & zip" value={row.stateZip} onChange={(stateZip) => {
            const previous = [...form.previous];
            previous[index] = { ...row, stateZip };
            patch({ previous });
          }} />
          <Field label="How long?" value={row.howLong} onChange={(howLong) => {
            const previous = [...form.previous];
            previous[index] = { ...row, howLong };
            patch({ previous });
          }} />
        </div>
      ))}
      <YesNoField label="Do you have the legal right to work in the United States?" value={form.legalRight} onChange={(legalRight) => patch({ legalRight })} />
      <YesNoField label="Can you provide proof of age?" value={form.proofOfAge} onChange={(proofOfAge) => patch({ proofOfAge })} />
      <YesNoField label="Have you worked for this company before?" value={form.workedHere} onChange={(workedHere) => patch({ workedHere })} />
      {form.workedHere === "yes" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Where?" value={form.workedWhere} onChange={(workedWhere) => patch({ workedWhere })} />
          <Field label="From" value={form.workedFrom} onChange={(workedFrom) => patch({ workedFrom })} />
          <Field label="To" value={form.workedTo} onChange={(workedTo) => patch({ workedTo })} />
          <Field label="Rate of pay" value={form.workedPay} onChange={(workedPay) => patch({ workedPay })} />
          <Field label="Position" value={form.workedPosition} onChange={(workedPosition) => patch({ workedPosition })} />
          <Field label="Reason for leaving" value={form.workedReason} onChange={(workedReason) => patch({ workedReason })} />
        </div>
      ) : null}
      <YesNoField label="Are you now employed?" value={form.employedNow} onChange={(employedNow) => patch({ employedNow })} />
      <Field label="If not, how long since leaving last employment?" value={form.sinceLeft} onChange={(sinceLeft) => patch({ sinceLeft })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Who referred you?" value={form.referredBy} onChange={(referredBy) => patch({ referredBy })} />
        <Field label="Rate of pay expected" value={form.payExpected} onChange={(payExpected) => patch({ payExpected })} />
      </div>
      <YesNoField label="Have you ever been bonded? (Answer only if a job requirement)" value={form.bonded} onChange={(bonded) => patch({ bonded })} />
      <Field label="Name of bonding company" value={form.bondingCompany} onChange={(bondingCompany) => patch({ bondingCompany })} />
      <YesNoField label="Have you ever been convicted of a felony?" value={form.felony} onChange={(felony) => patch({ felony })} />
      <p className="text-sm text-steel">If yes, explain fully. Conviction of a crime is not an automatic bar to employment — all circumstances will be considered.</p>
      <Area label="Felony explanation" value={form.felonyExplain} onChange={(felonyExplain) => patch({ felonyExplain })} />
      <YesNoField label="Is there any reason you might be unable to perform the functions of the job for which you have applied?" value={form.unable} onChange={(unable) => patch({ unable })} />
      <Area label="If yes, explain if you wish" value={form.unableExplain} onChange={(unableExplain) => patch({ unableExplain })} />
    </>
  );
}

function StepWork({ form, patch }: { form: FormState; patch: (partial: Partial<FormState>) => void }) {
  return (
    <>
      <Legal>{employmentHistoryNote}</Legal>
      <p className="text-xs text-steel">{cmvNote}</p>
      <p className="text-xs text-steel">{fmcsrNote}</p>
      {form.employers.map((job, index) => (
        <EmployerFields
          key={index}
          index={index}
          job={job}
          onChange={(next) => {
            const employers = [...form.employers];
            employers[index] = next;
            patch({ employers });
          }}
        />
      ))}
      {form.employers.length < 6 ? (
        <button type="button" className="h-11 rounded-full border border-line px-4 text-sm" onClick={() => patch({ employers: [...form.employers, blankEmployer()] })}>
          Add another employer
        </button>
      ) : null}
    </>
  );
}

function EmployerFields({ index, job, onChange }: { index: number; job: Employer; onChange: (job: Employer) => void }) {
  function set<K extends keyof Employer>(key: K, value: Employer[K]) {
    onChange({ ...job, [key]: value });
  }
  return (
    <fieldset className="grid gap-3 rounded-2xl border border-line p-4">
      <legend className="px-1 text-sm font-semibold">Employer {index + 1}</legend>
      <Field label="Name" value={job.name} onChange={(value) => set("name", value)} />
      <Field label="Address" value={job.address} onChange={(value) => set("address", value)} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="City" value={job.city} onChange={(value) => set("city", value)} />
        <Field label="State" value={job.state} onChange={(value) => set("state", value)} />
        <Field label="Zip" value={job.zip} onChange={(value) => set("zip", value)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Contact person" value={job.contact} onChange={(value) => set("contact", value)} />
        <Field label="Phone number" value={job.phone} onChange={(value) => set("phone", value)} />
        <Field label="From (mo/yr)" value={job.from} onChange={(value) => set("from", value)} />
        <Field label="To (mo/yr)" value={job.to} onChange={(value) => set("to", value)} />
        <Field label="Position held" value={job.position} onChange={(value) => set("position", value)} />
        <Field label="Salary / wage" value={job.salary} onChange={(value) => set("salary", value)} />
      </div>
      <Field label="Reason for leaving" value={job.reason} onChange={(value) => set("reason", value)} />
      <YesNoField name={`fmcsr-${index}`} label="Were you subject to the FMCSRs while employed?" value={job.fmcsr} onChange={(value) => set("fmcsr", value)} />
      <YesNoField name={`part40-${index}`} label="Was your job designated as a safety-sensitive function in any DOT-regulated mode subject to the drug and alcohol testing requirements of 49 CFR Part 40?" value={job.part40} onChange={(value) => set("part40", value)} />
    </fieldset>
  );
}

function StepDrive({ form, patch }: { form: FormState; patch: (partial: Partial<FormState>) => void }) {
  return (
    <>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.accidentsNone} onChange={(event) => patch({ accidentsNone: event.target.checked })} />
        No accidents in the past 3 years (write NONE)
      </label>
      {!form.accidentsNone
        ? form.accidents.map((row, index) => (
            <RowFields
              key={index}
              title={index === 0 ? "Last accident" : "Next previous"}
              labels={["Date", "Nature of accident", "Fatalities", "Injuries", "Hazmat spill"]}
              row={row}
              onChange={(next) => {
                const accidents = [...form.accidents];
                accidents[index] = next;
                patch({ accidents });
              }}
            />
          ))
        : null}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.ticketsNone} onChange={(event) => patch({ ticketsNone: event.target.checked })} />
        No traffic convictions or forfeitures in the past 3 years, other than parking
      </label>
      {!form.ticketsNone
        ? form.tickets.map((row, index) => (
            <RowFields
              key={index}
              title={`Conviction ${index + 1}`}
              labels={["Location", "Date", "Charge", "Penalty", ""]}
              row={row}
              onChange={(next) => {
                const tickets = [...form.tickets];
                tickets[index] = next;
                patch({ tickets });
              }}
            />
          ))
        : null}
      <p className="text-sm font-medium">Driver licenses or permits held in the past 3 years</p>
      {form.licenses.map((license, index) => (
        <div key={index} className="grid gap-3 rounded-2xl border border-line p-3 sm:grid-cols-2">
          <Field label="State" value={license.state} onChange={(state) => {
            const licenses = [...form.licenses];
            licenses[index] = { ...license, state };
            patch({ licenses });
          }} />
          <Field label="License no." value={license.number} onChange={(number) => {
            const licenses = [...form.licenses];
            licenses[index] = { ...license, number };
            patch({ licenses });
          }} />
          <Field label="Class" value={license.className} onChange={(className) => {
            const licenses = [...form.licenses];
            licenses[index] = { ...license, className };
            patch({ licenses });
          }} />
          <Field label="Endorsements" value={license.endorsements} onChange={(endorsements) => {
            const licenses = [...form.licenses];
            licenses[index] = { ...license, endorsements };
            patch({ licenses });
          }} />
          <Field label="Expiration date" value={license.expires} onChange={(expires) => {
            const licenses = [...form.licenses];
            licenses[index] = { ...license, expires };
            patch({ licenses });
          }} />
        </div>
      ))}
      <YesNoField label="A. Have you ever been denied a license, permit or privilege to operate a motor vehicle?" value={form.denied} onChange={(denied) => patch({ denied })} />
      <YesNoField label="B. Has any license, permit or privilege ever been suspended or revoked?" value={form.suspended} onChange={(suspended) => patch({ suspended })} />
      <Area label="If yes to A or B, give details" value={form.licenseDetails} onChange={(licenseDetails) => patch({ licenseDetails })} />
      <p className="text-sm font-medium">Driving experience — check yes or no. Circle type: van, tank, flat, dump, reefer.</p>
      {equipment.map((label, index) => {
        const row = form.experience[index];
        if (!row) return null;
        return (
          <div key={label} className="grid gap-3 rounded-2xl border border-line p-3">
            <YesNoField name={`equip-${index}`} label={label} value={row.yes} onChange={(yes) => {
              const experience = [...form.experience];
              experience[index] = { ...row, yes };
              patch({ experience });
            }} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Type of equipment" value={row.types} onChange={(types) => {
                const experience = [...form.experience];
                experience[index] = { ...row, types };
                patch({ experience });
              }} />
              <Field label="Approx. miles" value={row.miles} onChange={(miles) => {
                const experience = [...form.experience];
                experience[index] = { ...row, miles };
                patch({ experience });
              }} />
              <Field label="From (m/y)" value={row.from} onChange={(from) => {
                const experience = [...form.experience];
                experience[index] = { ...row, from };
                patch({ experience });
              }} />
              <Field label="To (m/y)" value={row.to} onChange={(to) => {
                const experience = [...form.experience];
                experience[index] = { ...row, to };
                patch({ experience });
              }} />
            </div>
          </div>
        );
      })}
      <Field label="States operated in for the last five years" value={form.statesOperated} onChange={(statesOperated) => patch({ statesOperated })} />
      <Area label="Special courses or training that will help you as a driver" value={form.courses} onChange={(courses) => patch({ courses })} />
      <Field label="Safe driving awards, and from whom" value={form.awards} onChange={(awards) => patch({ awards })} />
      <Area label="Other trucking, transportation, or experience that may help" value={form.otherExperience} onChange={(otherExperience) => patch({ otherExperience })} />
      <Area label="Courses and training not shown elsewhere" value={form.otherTraining} onChange={(otherTraining) => patch({ otherTraining })} />
      <Area label="Special equipment or technical materials you can work with" value={form.specialEquipment} onChange={(specialEquipment) => patch({ specialEquipment })} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Highest grade completed (1–8)" value={form.gradeSchool} onChange={(gradeSchool) => patch({ gradeSchool })} />
        <Field label="High school (1–4)" value={form.highSchool} onChange={(highSchool) => patch({ highSchool })} />
        <Field label="College (1–4)" value={form.college} onChange={(college) => patch({ college })} />
      </div>
      <Field label="Last school attended (name, city, state)" value={form.lastSchool} onChange={(lastSchool) => patch({ lastSchool })} />
      <Legal title="To be read and signed by applicant">
        This certifies that this application was completed by me, and that all entries on it and information in it are true and complete to the best of my knowledge.
      </Legal>
      <Field label="Signature" value={form.finalSigned} onChange={(finalSigned) => patch({ finalSigned })} />
    </>
  );
}

function StepHours({
  form,
  patch,
  totalHours,
}: {
  form: FormState;
  patch: (partial: Partial<FormState>) => void;
  totalHours: number;
}) {
  return (
    <>
      <Legal>
        Motor carriers, when using a driver for the first time, must obtain a signed statement of total time on duty during the immediately preceding 7 days and the time the driver was last relieved from duty, as required by 49 CFR 395.8(j)(2). Hours include compensated work for a non-motor carrier. Kept on file at least 6 months.
      </Legal>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {form.hours.map((hours, index) => (
          <div key={index} className="grid gap-2">
            <Field
              label={index === 0 ? "Day 1 (yesterday) date" : `Day ${index + 1} date`}
              value={form.hourDates[index] ?? ""}
              onChange={(value) => {
                const hourDates = [...form.hourDates];
                hourDates[index] = value;
                patch({ hourDates });
              }}
            />
            <Field
              label="Hours worked"
              value={hours}
              onChange={(value) => {
                const next = [...form.hours];
                next[index] = value;
                patch({ hours: next });
              }}
            />
          </div>
        ))}
      </div>
      <p className="text-sm font-medium">Total hours: {totalHours}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Last relieved from work at (time)" value={form.lastRelievedTime} onChange={(lastRelievedTime) => patch({ lastRelievedTime })} />
        <label className="grid gap-1 text-sm">
          A.M. / P.M.
          <select className="h-11 rounded-xl border border-line bg-paper px-3" value={form.lastRelievedAmPm} onChange={(event) => patch({ lastRelievedAmPm: event.target.value })}>
            <option>A.M.</option>
            <option>P.M.</option>
          </select>
        </label>
        <Field label="On (date)" type="date" value={form.lastRelievedOn} onChange={(lastRelievedOn) => patch({ lastRelievedOn })} />
      </div>
      <Field label="Signature — on-duty hours" value={form.hoursSigned} onChange={(hoursSigned) => patch({ hoursSigned })} />
      <Field label="Driver’s initials" value={form.hoursInitials} onChange={(hoursInitials) => patch({ hoursInitials })} />
      <Legal title="Driver certification for other compensated work">
        On-duty time includes work for other employers and any compensated work for a non-motor carrier. Once employed, if you begin working for any additional employer for compensation you must inform this company immediately.
      </Legal>
      <YesNoField label="Are you currently working for another employer?" value={form.otherEmployerNow} onChange={(otherEmployerNow) => patch({ otherEmployerNow })} />
      <YesNoField label="Do you intend to work for another employer while employed by Alpha Leasing?" value={form.intendOther} onChange={(intendOther) => patch({ intendOther })} />
    </>
  );
}

function StepReleases({ form, patch }: { form: FormState; patch: (partial: Partial<FormState>) => void }) {
  return (
    <>
      <Legal title="Fair Credit Reporting Act disclosure — form 730. Company: Alpha Leasing, LLC">{fcraStatement}</Legal>
      <Field label="Applicant’s signature" value={form.fcraSigned} onChange={(fcraSigned) => patch({ fcraSigned })} />
      <Legal title="Request for check of driving record — form 729">
        I hereby authorize you to release the following information to Alpha Leasing, LLC, {company.street}, {company.suite}, {company.city}, {company.state} {company.zip}, for purposes of investigation as required by 49 CFR 391.23 and 391.25. You are released from any and all liability which may result from furnishing such information. Requested by {company.name}. Attention {company.safety.name}, {company.safety.title}. Phone {company.phone}. Fax {company.fax}. Email {company.email}.
      </Legal>
      <p className="text-sm">
        Driver {form.firstName} {form.middle} {form.lastName} · DOB {form.dob || "—"} · SSN on file · License {form.licenses[0]?.number || "—"} · {form.licenses[0]?.state || "—"}
      </p>
      <Field label="Applicant’s signature" value={form.recordSigned} onChange={(recordSigned) => patch({ recordSigned })} />
      <Legal title="Certification of compliance with driver license requirements — form 1617">
        Possess only one license. Notify your employer the next business day of any revocation, suspension, cancellation, or disqualification, and report a conviction for a state or local traffic law (other than parking) within 30 days in writing. Your CDL must be issued by your state of domicile; transfer it within 30 days of a new domicile. I certify that I have read and understand the above requirements. Company: {company.name}. Date of hire is completed by the company.
      </Legal>
      <p className="text-sm">
        The following license is the only one I possess: {form.licenses[0]?.number || "—"} · {form.licenses[0]?.state || "—"} · class {form.licenses[0]?.className || "—"} · expires {form.licenses[0]?.expires || "—"}
      </p>
      <Field label="Driver’s signature" value={form.licenseSigned} onChange={(licenseSigned) => patch({ licenseSigned })} />
      <Legal title="Previous pre-employment alcohol and drug test statement — form 886">
        Sec. 40.25(j): Have you tested positive, or refused to test, on any pre-employment drug or alcohol test administered by an employer to which you applied for, but did not obtain, safety-sensitive transportation work covered by DOT agency drug and alcohol testing rules during the past two years?
      </Legal>
      <YesNoField label="Positive test or refusal in the past two years for a job you did not obtain?" value={form.drugPositive} onChange={(drugPositive) => patch({ drugPositive })} />
      <YesNoField label="If yes, can you document completion of the DOT return-to-duty process?" value={form.returnToDuty} onChange={(returnToDuty) => patch({ returnToDuty })} />
      <Field label="Prospective employee signature" value={form.drugSigned} onChange={(drugSigned) => patch({ drugSigned })} />
      <Legal title="Safety performance history — form 9652, section 1">
        I authorize my previous employer to release alcohol and controlled-substances testing records for the previous 3 years to the prospective employer below. Release must be by a confidential written form such as fax, email, or letter (49 CFR 40.25(g) and 391.23(h)).
      </Legal>
      <div className="rounded-2xl bg-paper p-4 text-sm leading-6">
        <p className="font-semibold">Prospective employer (prefilled)</p>
        <p>{company.name}</p>
        <p>Attention: {company.safety.name}, {company.safety.title}</p>
        <p>{company.street}, {company.suite}</p>
        <p>{company.city}, {company.state} {company.zip}</p>
        <p>Telephone {company.phone}</p>
        <p>Confidential fax {company.fax}</p>
        <p>Confidential email {company.email}</p>
      </div>
      <Field label="Previous employer to receive this request" value={form.sphPreviousEmployer} onChange={(sphPreviousEmployer) => patch({ sphPreviousEmployer })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Previous employer street" value={form.sphStreet} onChange={(sphStreet) => patch({ sphStreet })} />
        <Field label="City, state, zip" value={form.sphCity} onChange={(sphCity) => patch({ sphCity })} />
        <Field label="Email" value={form.sphEmail} onChange={(sphEmail) => patch({ sphEmail })} />
        <Field label="Telephone" value={form.sphPhone} onChange={(sphPhone) => patch({ sphPhone })} />
        <Field label="Fax" value={form.sphFax} onChange={(sphFax) => patch({ sphFax })} />
      </div>
      <Field label="Applicant’s signature" value={form.sphSigned} onChange={(sphSigned) => patch({ sphSigned })} />
      <Legal title="Alcohol and/or drug test notification — form 375. Company: Alpha Leasing, LLC">
        Part 382 applies to drivers of this company. Before performing an alcohol or controlled substances test, the employer shall notify the driver that the test is required by this part. No employer shall falsely represent that a test is administered under this part. Safety schedules the pre-employment controlled-substance test; this is not an appointment yet. I understand that, as a condition of employment with this company, that test is required.
      </Legal>
      <Field label="Driver / applicant signature" value={form.testSigned} onChange={(testSigned) => patch({ testSigned })} />

      <Legal title="Previous employer alcohol and drug test information — form 644-F, section 1">
        I authorize my previous employer to release my DOT drug and alcohol testing records to {company.name}, {company.street}, {company.suite}, {company.city}, {company.state} {company.zip}. Attention {company.safety.name}, {company.safety.title}. Phone {company.phone}. Confidential fax {company.fax}. Email {company.email}. Sections 2 and 3 are completed by that previous employer and are included in the printed application.
      </Legal>
      <Field label="Previous employer name" value={form.drug644Employer} onChange={(drug644Employer) => patch({ drug644Employer })} />
      <Field label="Previous employer mailing address" value={form.drug644Address} onChange={(drug644Address) => patch({ drug644Address })} />
      <Field label="Applicant signature — form 644-F" value={form.drug644Signed} onChange={(drug644Signed) => patch({ drug644Signed })} />
      <Legal title="Form 644-F, section 2 — previous employer completes">
        Applicant name and Social Security number. Employed from / to. Did the employee drive a commercial motor vehicle? Was the job safety-sensitive under DOT drug and alcohol rules? Alcohol test result of 0.04 or higher? Verified positive drug test? Refusal to test? Other DOT drug or alcohol violations? Did a previous employer report a violation to you? If yes to any, did the employee complete the return-to-duty process? Name, address, and phone of the substance abuse professional. Person providing this information: name, title, company, date, and phone.
      </Legal>
      <Legal title="Form 644-F, section 3 — previous employer completes if any answer above was yes">
        Dates of alcohol tests 0.04 or higher, verified positive drug tests, refusals, and other violations. Whether a prior employer reported a violation. Whether the employee completed a SAP evaluation, return-to-duty testing, and follow-up testing. SAP name, address, and phone.
      </Legal>

      <Legal title="Safety performance history — form 9652, section 2 — previous employer completes">
        Dates of employment, position held, reason for leaving, and whether the driver is eligible for rehire. Accidents in the past 3 years: date, city and state, description, hazardous materials, fatalities, and injuries. Any DOT alcohol or controlled-substance violations. Person releasing this record: name, title, date, and phone.
      </Legal>
      <Legal title="Correction or rebuttal — form 9652, section 3">
        If you disagree with the safety performance history a previous employer provides, you may attach a rebuttal. {company.name} will forward it to that employer and keep it with your application.
      </Legal>
      <Area label="Rebuttal statement (optional)" value={form.sphRebuttal} onChange={(sphRebuttal) => patch({ sphRebuttal })} />
      <Field label="Applicant signature — rebuttal, if any" value={form.sphRebuttalSigned} onChange={(sphRebuttalSigned) => patch({ sphRebuttalSigned })} />
    </>
  );
}

function StepReview({
  form,
  patch,
  totalHours,
}: {
  form: FormState;
  patch: (partial: Partial<FormState>) => void;
  totalHours: number;
}) {
  const employers = form.employers.filter((job) => job.name.trim());
  return (
    <>
      <p className="text-sm leading-6 text-steel">
        Check this against the packet safety keeps: application 691, FCRA 730, driving-record request 729, on-duty hours 644-F, license certification 1617, drug statement 886, safety performance history 9652, and test notification 375. Road test, medical card, and the driver record card are completed by the company after you are in process.
      </p>
      <dl className="grid gap-2 text-sm">
        <div><dt className="text-steel">Applicant</dt><dd>{form.firstName} {form.middle} {form.lastName}</dd></div>
        <div><dt className="text-steel">Position</dt><dd>{form.position}</dd></div>
        <div><dt className="text-steel">Phone / email</dt><dd>{form.phone} · {form.email}</dd></div>
        <div><dt className="text-steel">Address</dt><dd>{form.street}, {form.city}, {form.state} {form.zip}</dd></div>
        <div><dt className="text-steel">Employers listed</dt><dd>{employers.map((job) => job.name).join(", ") || "None"}</dd></div>
        <div><dt className="text-steel">On-duty hours, prior 7 days</dt><dd>{totalHours}</dd></div>
        <div><dt className="text-steel">Applying to</dt><dd>{company.name}, {company.street}, {company.suite}, {company.city}, {company.state} {company.zip}</dd></div>
      </dl>
      <Field label="Date of application" type="date" value={form.signDate} onChange={(signDate) => patch({ signDate })} />
      <p className="text-xs text-steel">Social Security number is stored with the application for the qualification file and is not shown on this summary.</p>
    </>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="grid gap-1 text-sm">
      {label}
      <input className="h-11 rounded-xl border border-line bg-paper px-3" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm">
      {label}
      <textarea className="min-h-20 rounded-xl border border-line bg-paper px-3 py-2" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function YesNoField({ label, value, onChange, name }: { label: string; value: YesNo; onChange: (value: YesNo) => void; name?: string }) {
  const group = name ?? label;
  return (
    <fieldset className="grid gap-2 text-sm">
      <legend>{label}</legend>
      <div className="flex gap-4">
        {(["yes", "no"] as const).map((option) => (
          <label key={option} className="inline-flex items-center gap-2">
            <input type="radio" name={group} checked={value === option} onChange={() => onChange(option)} />
            {option === "yes" ? "Yes" : "No"}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Legal({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="max-h-48 overflow-y-auto rounded-2xl bg-paper p-4 text-sm leading-6">
      {title ? <p className="mb-2 font-semibold">{title}</p> : null}
      {children}
    </div>
  );
}

function RowFields({
  title,
  labels,
  row,
  onChange,
}: {
  title: string;
  labels: string[];
  row: Row3;
  onChange: (row: Row3) => void;
}) {
  const keys = ["a", "b", "c", "d", "e"] as const;
  return (
    <div className="grid gap-3 rounded-2xl border border-line p-3 sm:grid-cols-2">
      <p className="text-sm font-medium sm:col-span-2">{title}</p>
      {keys.map((key, index) =>
        labels[index] ? (
          <Field key={key} label={labels[index]} value={row[key]} onChange={(value) => onChange({ ...row, [key]: value })} />
        ) : null,
      )}
    </div>
  );
}
