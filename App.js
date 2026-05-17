import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, Pressable, ScrollView, LogBox, Animated, Keyboard} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import EmojiPicker from 'react-native-emoji-chooser';

// Esconde avisos da biblioteca dos emotes
LogBox.ignoreLogs([
  'Warning: react-native-emoji-chooser',
  'ViewPropTypes will be removed',
  'AsyncStorage has been extracted',
  'EventEmitter.removeListener',
]);
LogBox.ignoreAllLogs(true); // Ignora lgs temporariamente

export default function App() {
  const [tasks, setTasks] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newTaskEmoji, setNewTaskEmoji] = useState('📝');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // Formata a data
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const toggleTaskCompletion = (taskId) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      category: newTaskCategory.trim() || 'Geral',
      emoji: newTaskEmoji,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    closeModal();
  };

  const closeModal = () => {
    setModalVisible(false);
    setNewTaskTitle('');
    setNewTaskCategory('');
    setNewTaskEmoji('📝');
    setIsEmojiPickerOpen(false);
  };

  const onEmojiSelected = (emoji) => {
    setNewTaskEmoji(emoji);
    setIsEmojiPickerOpen(false);
  };

  const renderTask = (task) => (
    <View key={task.id} style={styles.taskContainer}>
      <Checkbox
        style={styles.checkbox}
        value={task.completed}
        onValueChange={() => toggleTaskCompletion(task.id)}
        color={task.completed ? '#4CAF50' : '#888'}
      />
      <View style={styles.taskDetails}>
        <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
          {task.title}
        </Text>
        {!task.completed && (
          <View style={styles.taskMeta}>
            <Text style={styles.taskEmoji}>{task.emoji}</Text>
            {task.category ? (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{task.category}</Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.dateText}>Minhas Tarefas</Text>
        <Text style={styles.title}>{formattedDate}</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statText}>{incompleteTasks.length} Incompletas</Text>
          <Text style={styles.statDot}>•</Text>
          <Text style={styles.statText}>{completedTasks.length} Realizadas</Text>
        </View>
      </View>

      {/* Listas de tarefas */}
      <View style={styles.boardsContainer}>
        {/* Incompletas  */}
        <View style={[styles.boardColumn, { flex: 1.5 }]}>
          <Text style={styles.sectionTitle}>Incompletas</Text>
          <ScrollView
            style={styles.boardScroll}
            contentContainerStyle={styles.boardContent}
            showsVerticalScrollIndicator={false}
          >
            {incompleteTasks.length > 0 ? (
              incompleteTasks.map(renderTask)
            ) : (
              <Text style={styles.emptyText}>Nenhuma tarefa incompleta.</Text>
            )}
          </ScrollView>
        </View>

        {/* Realizadas */}
        <View style={styles.boardColumn}>
          <Text style={styles.sectionTitle}>Realizadas</Text>
          <ScrollView
            style={styles.boardScroll}
            contentContainerStyle={[styles.boardContent, { paddingBottom: 100 }]}
            showsVerticalScrollIndicator={false}
          >
            {completedTasks.length > 0 ? (
              completedTasks.map(renderTask)
            ) : (
              <Text style={styles.emptyText}>Nenhuma tarefa realizada.</Text>
            )}
          </ScrollView>
        </View>
      </View>

      {/* BOtao flutuante para adição de tarefa*/}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <MaterialIcons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Modal de adição para tarefa noa*/}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          {/* Quand clica fora ele fecha o modal */}
          <Pressable style={styles.modalDismissArea} onPress={closeModal} />

          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Tarefa</Text>
              <TouchableOpacity onPress={closeModal}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nome da tarefa"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              placeholderTextColor="#999"
            />

            <TextInput
              style={styles.input}
              placeholder="Categoria (ex: Trabalho)"
              value={newTaskCategory}
              onChangeText={setNewTaskCategory}
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={styles.emojiSelectorButton}
              onPress={() => {
                Keyboard.dismiss();
                setIsEmojiPickerOpen(!isEmojiPickerOpen);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.emojiSelectorText}>
                {isEmojiPickerOpen ? 'Fechar Seletor' : `Escolher Emoji: ${newTaskEmoji}`}
              </Text>
            </TouchableOpacity>

            {isEmojiPickerOpen && (
              <View style={styles.emojiPickerContainer}>
                <EmojiPicker onSelect={onEmojiSelected} />
              </View>
            )}

            <TouchableOpacity style={styles.addButton} onPress={addTask} activeOpacity={0.8}>
              <Text style={styles.addButtonText}>Adicionar Nova Tarefa</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ffffffff',
  },
  dateText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  statDot: {
    fontSize: 14,
    color: '#CCC',
    marginHorizontal: 8,
  },
  boardsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  boardColumn: {
    flex: 1,
  },
  boardScroll: {
    flex: 1,
  },
  boardContent: {
    paddingBottom: 16,
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 16,
    marginBottom: 12,
  },
  checkbox: {
    marginRight: 16,
    borderRadius: 6,
    width: 24,
    height: 24,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  taskTitleCompleted: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  taskEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#1A73E8',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1A73E8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    flexShrink: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  input: {
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  emojiSelectorButton: {
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    alignItems: 'center',
  },
  emojiSelectorText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  emojiPickerContainer: {
    height: 300,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#1A73E8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
