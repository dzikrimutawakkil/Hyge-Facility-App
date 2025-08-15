import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Modal, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  email: z.string().email('Invalid email address.'),
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long.').optional().or(z.literal('')),
});

type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

interface UpdateProfileFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateProfileFormValues) => void;
  isUpdating: boolean;
  currentName: string;
  currentEmail: string;
}

export const UpdateProfileForm: React.FC<UpdateProfileFormProps> = ({ visible, onClose, onSubmit, isUpdating, currentName, currentEmail }) => {
  const { control, handleSubmit, formState: { errors } } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: currentName,
      email: currentEmail,
      currentPassword: '',
      newPassword: '',
    },
  });

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Update Profile</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Email"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="email-address"
              />
            )}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

          <Controller
            control={control}
            name="currentPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Current Password"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                secureTextEntry
              />
            )}
          />
          {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword.message}</Text>}

          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="New Password (optional)"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                secureTextEntry
              />
            )}
          />
          {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword.message}</Text>}

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={onClose}
            >
              <Text style={styles.textStyle}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonUpdate]}
              onPress={handleSubmit(onSubmit)}
              disabled={isUpdating}
            >
              {isUpdating ? <ActivityIndicator color="#fff" /> : <Text style={styles.textStyle}>Update</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      },
      modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
      },
      button: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        marginHorizontal: 5,
        flex: 1,
      },
      buttonContainer: {
        flexDirection: 'row',
        marginTop: 15,
        width: '100%',
      },
      buttonUpdate: {
        backgroundColor: '#2196F3',
      },
      buttonClose: {
        backgroundColor: '#f44336',
      },
      textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
      },
      modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
      },
      input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        width: '100%',
        paddingHorizontal: 10,
        marginBottom: 10,
      },
      errorText: {
        color: 'red',
        alignSelf: 'flex-start',
        marginLeft: 5,
        marginBottom: 10,
      },
});
