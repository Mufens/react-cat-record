import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Drawer, Form, Input, Radio, Select, InputNumber, Upload, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { addCatData, editCatData } from '@/api/cat';
import type { CatItem } from '@/types/cat';
import './CatEdit.scss';

interface CatEditProps {
  onSuccess?: (type: 'add' | 'edit') => void;
}

export interface CatEditRef {
  open: (row?: CatItem) => void;
}

const CatEdit = forwardRef<CatEditRef, CatEditProps>(({ onSuccess }, ref) => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [imgUrl, setImgUrl] = useState('');

  useImperativeHandle(ref, () => ({
    open: (row?: CatItem) => {
      setVisible(true);
      if (row?.id) {
        form.setFieldsValue(row);
        setImgUrl(row.catImg || '');
      } else {
        form.resetFields();
        form.setFieldsValue({
          gender: '公',
          healthStatus: '健康',
          adoptionStatus: '未领养',
          friendliness: 5,
        });
        setImgUrl('');
      }
    },
  }));

  const onSelectFile = (file: UploadFile) => {
    const rawFile = file.originFileObj;
    if (!rawFile) return false;

    if (!['image/jpeg', 'image/png'].includes(rawFile.type)) {
      message.error('仅支持 JPEG/PNG 格式');
      return false;
    }

    try {
      const url = URL.createObjectURL(rawFile);
      setImgUrl(url);
      const reader = new FileReader();
      reader.onload = () => {
        form.setFieldsValue({ catImg: reader.result as string });
      };
      reader.readAsDataURL(rawFile);
    } catch {
      message.error('图片处理失败');
    }

    return false; // 阻止自动上传
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const requestData: Partial<CatItem> = {
        ...values,
        friendliness: Number(values.friendliness),
        ...(form.getFieldValue('id') && { id: form.getFieldValue('id') }),
      };

      if (form.getFieldValue('id')) {
        await editCatData(form.getFieldValue('id'), requestData);
        message.success('修改成功');
        onSuccess?.('edit');
      } else {
        await addCatData(requestData);
        message.success('添加成功');
        onSuccess?.('add');
      }

      setVisible(false);
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  return (
    <Drawer
      open={visible}
      onClose={() => setVisible(false)}
      title={form.getFieldValue('id') ? '编辑猫咪' : '添加猫咪'}
      width={340}
    >
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item label="照片" name="catImg">
          <Upload
            listType="picture-card"
            showUploadList={false}
            beforeUpload={onSelectFile}
            accept="image/jpeg,image/png"
          >
            {imgUrl ? (
              <img src={imgUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入猫咪姓名' }]}>
          <Input placeholder="请输入猫咪姓名" />
        </Form.Item>

        <Form.Item label="品种" name="breed">
          <Input placeholder="请输入品种" />
        </Form.Item>

        <Form.Item label="年龄" name="age">
          <Input placeholder="请输入年龄" />
        </Form.Item>

        <Form.Item label="性别" name="gender">
          <Radio.Group>
            <Radio value="公">公</Radio>
            <Radio value="母">母</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="健康状况" name="healthStatus">
          <Select>
            <Select.Option value="健康">健康</Select.Option>
            <Select.Option value="生病">生病</Select.Option>
            <Select.Option value="喵星">喵星</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="亲和度" name="friendliness">
          <InputNumber min={1} max={5} controls={{ position: 'right' }} />
        </Form.Item>

        <Form.Item label="区域" name="area">
          <Input placeholder="请输入活动区域" />
        </Form.Item>
      </Form>

      <div className="form-action-buttons">
        <Button onClick={() => setVisible(false)}>取消</Button>
        <Button type="primary" onClick={onSubmit}>
          确认
        </Button>
      </div>
    </Drawer>
  );
});

CatEdit.displayName = 'CatEdit';

export default CatEdit;

