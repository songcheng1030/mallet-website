import { Tooltip } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { showNotification } from "../../shared/helpers";

type Props = {
  value: any;
  label: any;
};

export const CopyableLabel = ({ value, label }: Props) => {
  const onCopy = () => {
    var textField = document.createElement('textarea')
    textField.innerText = String(value)
    document.body.appendChild(textField)
    textField.select()
    document.execCommand('copy')
    textField.remove()
    showNotification("Copied!", "success", "topRight")
  }
  return (
    <div className="flex items-center">
      <Tooltip placement="right" title="Copy to clipboard">
        <span>
          {label}
        </span>
          <CopyOutlined
              className="ml-1 cursor-pointer text-yellow-500 hover:text-yellow-400"
              onClick={onCopy}
            />
      </Tooltip>
    </div>
  );
}
