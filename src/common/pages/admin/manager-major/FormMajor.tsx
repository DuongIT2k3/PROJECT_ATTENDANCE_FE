import { cloneElement, isValidElement, ReactElement, ReactNode, useState } from "react";
import { Major } from "../../../types/Major";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Input, message, Modal } from "antd";
import { createMajor, updateMajor } from "../../../services/majorServices";

export default function FormMajor({
    children,
    majorEdit = null,
} : {
    children: ReactNode;
    majorEdit?: Major | null;
}
) {
    const [modalOpen, setModalOpen] = useState(false);
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const createMutation = useMutation({
        mutationFn: createMajor,
        onSuccess: () => {
            message.success("Thêm chuyên ngành thành công");
            queryClient.invalidateQueries({queryKey: ["majors"] });
            setModalOpen(false);
            form.resetFields();
        },
        onError: () => message.error("Thêm chuyên ngành thất bại. "),

    });
    const handleOk = () => {
        form.validateFields().then((values) => {
            if(majorEdit) {
                updateMutation.mutate({ id: majorEdit._id, payload: values});
            } else {
                createMutation.mutate(values);
            }
        });
    };
    const updateMutation = useMutation({
        mutationFn: ({id, payload} : { id: string; payload: Partial<Major>  }) => updateMajor(id, payload),
        onSuccess: () => {
            message.success("Cập nhật chuyên ngành thành công");
            queryClient.invalidateQueries({queryKey: ["majors"] });
            setModalOpen(false);
            form.resetFields();
        },
        onError: () => message.error("Cập nhật chuyên ngành thất bại"),
    });

    const handleEdit = (major: Major) => {
        setModalOpen(true);
        form.setFieldsValue(major);
    };

    const handleAdd = () => {
        setModalOpen(true);
        form.resetFields();
    };
    return (
        <>
            {isValidElement(children)
             ? cloneElement(children as ReactElement, {
                onClick: () => (majorEdit ? handleEdit(majorEdit) : handleAdd()),
             })
            : children}
            <Modal title={majorEdit ? "Cập nhật chuyên ngành" : "Thêm chuyên ngành"} open={modalOpen} onOk={handleOk} onCancel={() => {
                setModalOpen(false);
                form.resetFields();
            }}
            okText={majorEdit ? "Cập nhật" : "Thêm mới"}
            cancelText="Huỷ"
            destroyOnHidden
            >
                <Form form={form} layout="vertical" initialValues={{name: "", description:"", code: ""}}>
                    <Form.Item 
                    label="Mã chuyên ngành"
                    name="code"
                    rules={[
                        {required: true, message: "Vui lòng nhập mã chuyên ngành"},
                        {
                            pattern: /^[A-Z]{2,}$/,
                            message: "Chỉ nhập chữ in hoa, tối thiểu 2 ký tự",
                        },
                    ]}
                >
                    <Input placeholder="IT, CS, SE" maxLength={10} />
                </Form.Item> 
                <Form.Item 
                label="Tên chuyên ngành"
                name="name"
                rules={[
                    {required: true, message: "Vui lòng nhập tên chuyên ngành"},
                ]}
                >
                    <Input placeholder="Nhập tên chuyên ngành" />
                </Form.Item>
                <Form.Item
                    label="Mô tả"
                    name="description"
                    rules={[{ required: true, message: "Vui lòng nhập mô tả"}]}
                >
                    <Input.TextArea placeholder="Nhập mô tả chuyên ngành" rows={3} />
                </Form.Item>
                </Form>
            </Modal>
        </>
    );
}