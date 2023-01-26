import { Col, Collapse, Row } from "antd";
import { ArrowDownOutlined } from "@ant-design/icons";
import { ReactNode, useState } from "react";

type CollapsibleListItemProps = {
  name: ReactNode;
  description: ReactNode;
  children: ReactNode;
};

export const CollapsibleListItem = ({
  name,
  description,
  children,
}: CollapsibleListItemProps) => {
  const [show, setShow] = useState(false);

  const toggleShow = () => {
    setShow((prev) => !prev);
  };

  return (
    <div className="border">
      <Collapse
        activeKey={show ? 1 : undefined}
        ghost
        collapsible="header"
        className="custom-collapse"
      >
        <Collapse.Panel
          showArrow={false}
          key={1}
          header={
            <Row
              gutter={[16, 16]}
              className="cursor-default items-center p-2 pl-4"
            >
              <Col span={8} className="text-xl">
                {name}
              </Col>
              <Col span={16} className="text-xl flex flex-row items-center">
                <div className="flex-1 truncate">{description}</div>
                <div className="cursor-pointer" onClick={toggleShow}>
                  {
                    <ArrowDownOutlined
                      className={`p-4 hover:bg-gray-100 rounded-full transition duration-200 ease-in-out transform ${
                        show ? "-rotate-180" : ""
                      }`}
                    />
                  }
                </div>
              </Col>
            </Row>
          }
        >
          <div className="p-4 border-t">{children}</div>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};

type AddButtonProps = {
  children: ReactNode;
  onClick: () => void;
};

export const AddButton = ({ children, onClick }: AddButtonProps) => (
  <div
    className="text-center border border-dashed p-4 text-2xl text-gray-400 hover:text-gray-700 cursor-pointer transition duration-200"
    onClick={onClick}
  >
    {children}
  </div>
);

type CollapsibleListProps = {
  children: ReactNode;
};

const CollapsibleList = ({ children }: CollapsibleListProps) => {
  return <div className="grid grid-cols-1 gap-4">{children}</div>;
};

CollapsibleList.Item = CollapsibleListItem;
CollapsibleList.AddButton = AddButton;

export { CollapsibleList };
