/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  cloneElement,
  isValidElement,
  ReactElement,
  ReactNode,
  useState,
} from "react";
import { IClass } from "../../../types/Classes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Form,
  Input,
  message,
  Modal,
  InputNumber,
  DatePicker,
  Select,
  Checkbox,
  Row,
  Col,
} from "antd";
import { createClass, updateClass } from "../../../services/classServices";
import { InfiniteSelect } from "../../../../components/common/InfiniteSelect";
import { getAllSubjects } from "../../../services/subjectService";
import { getAllMajors } from "../../../services/majorServices";
import { getAllUsers } from "../../../services/userServices";
import { Subject } from "../../../types/Subject";
import { Major } from "../../../types/Major";
import User from "../../../types/User";
import { RoomEnum } from "../../../types";
import dayjs from "dayjs";
import StudentSelector from "./StudentSelector";

const { TextArea } = Input;

export default function FormClass({
  children,
  classEdit = null,
}: {
  children: ReactNode;
  classEdit?: IClass | null;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const createMutation = useMutation({
    mutationFn: createClass,
    onSuccess: () => {
      message.success("Thêm lớp học thành công");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      setModalOpen(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Thêm lớp học thất bại");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<IClass> }) =>
      updateClass(id, payload),
    onSuccess: () => {
      message.success("Cập nhật lớp học thành công");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      setModalOpen(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(
        error?.response?.data?.message || "Cập nhật lớp học thất bại"
      );
    },
  });

  const handleOk = () => {
    form.validateFields().then((values) => {
      const formattedValues = {
        ...values,
        startDate: values.startDate
          ? values.startDate.format("YYYY-MM-DD")
          : undefined,
        daysOfWeek: values.daysOfWeek || [],
        room: values.room || "",
      };

      if (classEdit) {
        updateMutation.mutate({
          id: classEdit._id,
          payload: formattedValues,
        });
      } else {
        createMutation.mutate(formattedValues);
      }
    });
  };

  const handleEdit = (classData: IClass) => {
    setModalOpen(true);
    form.setFieldsValue({
      ...classData,
      startDate: classData.startDate ? dayjs(classData.startDate) : undefined,
      subjectId: classData.subjectId?._id,
      majorId: classData.majorId?._id,
      teacherId: classData.teacherId?._id,
      daysOfWeek: classData.daysOfWeek
        ? classData.daysOfWeek.split(",").map(Number)
        : [],
      studentIds: Array.isArray(classData.studentIds)
        ? classData.studentIds.map((student) =>
            typeof student === "object" ? student._id : student
          )
        : [],
    });
  };

  const handleAdd = () => {
    setModalOpen(true);
    form.resetFields();
  };

  const shiftOptions = [
    { value: "1", label: "Ca 1 (07:15-09:15)" },
    { value: "2", label: "Ca 2 (09:25-11:25)" },
    { value: "3", label: "Ca 3 (12:00-14:00)" },
    { value: "4", label: "Ca 4 (14:10-16:10)" },
    { value: "5", label: "Ca 5 (16:20-18:20)" },
    { value: "6", label: "Ca 6 (18:30-20:30)" },
  ];

  const daysOfWeekOptions = [
    { label: "Thứ 2", value: 1 },
    { label: "Thứ 3", value: 2 },
    { label: "Thứ 4", value: 3 },
    { label: "Thứ 5", value: 4 },
    { label: "Thứ 6", value: 5 },
    { label: "Thứ 7", value: 6 },
    { label: "Chủ nhật", value: 0 },
  ];

  // Tạo room options từ RoomEnum
  const roomOptions = Object.entries(RoomEnum).map(([, value]) => ({
    value: value,
    label:
      value === "Online"
        ? "🌐 Online"
        : value === "Hội trường"
        ? "🏛️ Hội trường"
        : value === "Thư viện"
        ? "📚 Thư viện"
        : value.startsWith("F")
        ? `💻 ${value} - Phòng máy tính`
        : value.startsWith("B")
        ? `🔬 ${value} - Phòng thực hành`
        : `📖 ${value} - Phòng lý thuyết`,
  }));

  // Watch maxStudents để cập nhật StudentSelector
  const maxStudents = Form.useWatch("maxStudents", form) || 30;

  return (
    <>
      {isValidElement(children)
        ? cloneElement(children as ReactElement<any>, {
            onClick: () => (classEdit ? handleEdit(classEdit) : handleAdd()),
          })
        : children}
      <Modal
        title={classEdit ? "Cập nhật lớp học" : "Thêm lớp học"}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        okText={classEdit ? "Cập nhật" : "Thêm mới"}
        cancelText="Huỷ"
        destroyOnHidden
        width={800}
        style={{
          top: 20,
        }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: "",
            description: "",
            totalSessions: 15,
            maxStudents: 30,
            room: "",
            linkOnline: "",
            studentIds: [],
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên lớp học"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên lớp học" },
                ]}
              >
                <Input placeholder="Nhập tên lớp học" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Môn học"
                name="subjectId"
                rules={[{ required: true, message: "Vui lòng chọn môn học" }]}
              >
                <InfiniteSelect<Subject>
                  labelDataIndex="name"
                  valueDataIndex="_id"
                  placeholder="Chọn môn học"
                  queryKey={["subjects"]}
                  fetchFn={(params: any) =>
                    getAllSubjects({ isDeleted: false, ...params })
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Chuyên ngành"
                name="majorId"
                rules={[
                  { required: true, message: "Vui lòng chọn chuyên ngành" },
                ]}
              >
                <InfiniteSelect<Major>
                  labelDataIndex="name"
                  valueDataIndex="_id"
                  placeholder="Chọn chuyên ngành"
                  queryKey={["majors"]}
                  fetchFn={(params: any) =>
                    getAllMajors({ isDeleted: false, ...params })
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giáo viên"
                name="teacherId"
                rules={[{ required: true, message: "Vui lòng chọn giáo viên" }]}
              >
                <InfiniteSelect<User>
                  labelDataIndex="fullname"
                  valueDataIndex="_id"
                  placeholder="Chọn giáo viên"
                  queryKey={["teachers"]}
                  fetchFn={(params: any) =>
                    getAllUsers({
                      role: "teacher",
                      isBlocked: false,
                      ...params,
                    })
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ngày bắt đầu"
                name="startDate"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày bắt đầu"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ca học"
                name="shift"
                rules={[{ required: true, message: "Vui lòng chọn ca học" }]}
              >
                <Select placeholder="Chọn ca học" options={shiftOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Số buổi học"
                name="totalSessions"
                rules={[
                  { required: true, message: "Vui lòng nhập số buổi học" },
                  {
                    type: "number",
                    min: 1,
                    message: "Số buổi học phải lớn hơn 0",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Nhập số buổi học"
                  min={1}
                  max={100}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Sĩ số tối đa"
                name="maxStudents"
                rules={[
                  { required: true, message: "Vui lòng nhập sĩ số tối đa" },
                  {
                    type: "number",
                    min: 1,
                    max: 100,
                    message: "Sĩ số từ 1-100",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Nhập sĩ số tối đa"
                  min={1}
                  max={100}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Phòng học"
                name="room"
                rules={[{ required: true, message: "Vui lòng chọn phòng học" }]}
              >
                <Select
                  placeholder="Chọn phòng học"
                  options={roomOptions}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Ngày học trong tuần"
            name="daysOfWeek"
            rules={[
              { required: true, message: "Vui lòng chọn ít nhất 1 ngày" },
            ]}
          >
            <Checkbox.Group options={daysOfWeekOptions} />
          </Form.Item>

          <Form.Item
            label="Sinh viên tham gia (tùy chọn)"
            name="studentIds"
            tooltip="Bạn có thể thêm sinh viên ngay khi tạo lớp hoặc thêm sau"
          >
            <StudentSelector maxStudents={maxStudents} />
          </Form.Item>

          <Form.Item label="Link học online (tùy chọn)" name="linkOnline">
            <Input placeholder="Nhập link học online" />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <TextArea
              placeholder="Nhập mô tả lớp học"
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
