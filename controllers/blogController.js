const BlogPost = require('../models/BlogPost');
const Site = require('../models/Site');

exports.createPost = async (req, res) => {
  try {
    const { siteId, title, content, status } = req.body;

    // Vérifier que l'utilisateur est propriétaire du site
    const site = await Site.findById(siteId);
    if (!site || site.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const post = await BlogPost.create({
      siteId,
      title,
      content,
      status
    });

    res.status(201).json({
      message: 'Article créé avec succès',
      post
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'article:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'article' });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, status } = req.body;

    const post = await BlogPost.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }

    // Vérifier que l'utilisateur est propriétaire du site
    const site = await Site.findById(post.site_id);
    if (!site || site.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const updatedPost = await BlogPost.update({
      id,
      title,
      content,
      status
    });

    res.json({
      message: 'Article mis à jour avec succès',
      post: updatedPost
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'article:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'article' });
  }
};

exports.getSitePosts = async (req, res) => {
  try {
    const { siteId } = req.params;

    // Vérifier que l'utilisateur est propriétaire du site
    const site = await Site.findById(siteId);
    if (!site || site.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const posts = await BlogPost.findBySite(siteId);
    res.json({ posts });
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des articles' });
  }
};

exports.getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }

    // Vérifier que l'utilisateur est propriétaire du site
    const site = await Site.findById(post.site_id);
    if (!site || site.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'article' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }

    // Vérifier que l'utilisateur est propriétaire du site
    const site = await Site.findById(post.site_id);
    if (!site || site.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    await BlogPost.delete(id);
    res.json({ message: 'Article supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'article:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'article' });
  }
};
