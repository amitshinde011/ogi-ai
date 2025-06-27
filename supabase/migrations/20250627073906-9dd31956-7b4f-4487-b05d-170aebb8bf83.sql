
-- Add Row Level Security policies for all social tables

-- Posts policies
CREATE POLICY "Users can view all posts" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own posts" ON public.posts
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own posts" ON public.posts
  FOR UPDATE USING (user_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own posts" ON public.posts
  FOR DELETE USING (user_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

-- Comments policies
CREATE POLICY "Users can view all comments" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.comments
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (user_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE USING (user_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

-- Likes policies
CREATE POLICY "Users can view all likes" ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "Users can create likes" ON public.likes
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own likes" ON public.likes
  FOR DELETE USING (user_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

-- Followers policies
CREATE POLICY "Users can view all followers" ON public.followers
  FOR SELECT USING (true);

CREATE POLICY "Users can create follower relationships" ON public.followers
  FOR INSERT WITH CHECK (follower_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their following relationships" ON public.followers
  FOR DELETE USING (follower_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

-- Conversations policies
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid())));

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (true);

-- Conversation participants policies
CREATE POLICY "Users can view conversation participants" ON public.conversation_participants
  FOR SELECT USING (conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid())));

CREATE POLICY "Users can add themselves to conversations" ON public.conversation_participants
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid())));

CREATE POLICY "Users can create messages in their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()) AND
    conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()))
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (recipient_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (sender_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (recipient_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));
