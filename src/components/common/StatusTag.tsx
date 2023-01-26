import React from "react";
import {
  STATUS_SUCCESS,
} from "@torobot/shared/src";
import { Tag } from "antd";

type Props = {
  status: string;
};

function getStatusTag(status: string) {
  switch (status) {
    case STATUS_SUCCESS:
      return <Tag color="green">Received</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
}

export const StatusTag = ({ status }: Props) => {
  return getStatusTag(status);
};
