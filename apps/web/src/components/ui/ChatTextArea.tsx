import SubmitButton from "./buttons/SubmitButton";
import TextArea from '../input/TextArea';
import ModelOptionsPopover from "../popovers/ModelOptionsPopover";
import AgenticOptionsPopover from "../popovers/AgenticOptionsPopover";

export default function ChatTextArea() {

  const maxHeight = 240;

  return (
    <div
      className={
        `w-full bg-secondary relative p-2 rounded-[24px]`
      }
    >
      <div className={
        `w-full px-3`
      }>
        <TextArea maxHeight={maxHeight} />
      </div>
      <div className={
        `w-full flex justify-between items-center`
      }>
        <AgenticOptionsPopover />
        <div className={`flex items-center gap-2`}>
          <ModelOptionsPopover />
          <SubmitButton />
        </div>
      </div>
    </div>
  );
}
